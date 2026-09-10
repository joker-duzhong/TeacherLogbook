import { mkdir, writeFile } from 'node:fs/promises';
import openapiTS from 'openapi-typescript';
import ts from 'typescript';

const endpoint = process.env.OPENAPI_URL ?? 'http://192.168.31.93:8000/api/v1/openapi.json';
const response = await fetch(endpoint, { signal: AbortSignal.timeout(15000) });
if (!response.ok) throw new Error(`OpenAPI request failed: HTTP ${response.status}`);
const source = await response.json();
const prefix = '/api/v1/teacher-logbook';
const selected = {
  '/api/v1/auth/sms/send': ['post'],
  '/api/v1/auth/phone/login': ['post'],
  '/api/v1/auth/phone/bind': ['post'],
  '/api/v1/auth/miniapp/login': ['post'],
  '/api/v1/auth/refresh': ['post'],
  '/api/v1/auth/me': ['get'],
  '/api/v1/auth/scan/apps': ['get'],
  '/api/v1/auth/scan/sessions': ['post'],
  '/api/v1/auth/scan/sessions/{transaction_id}': ['get'],
  '/api/v1/auth/scan/exchange': ['post'],
  [`${prefix}/classes`]: ['get', 'post'],
  [`${prefix}/classes/{class_id}/students`]: ['get', 'post'],
  [`${prefix}/classes/{class_id}/students/{student_id}`]: ['get', 'patch', 'delete'],
};
const paths = {};
for (const [route, operations] of Object.entries(source.paths ?? {})) {
  if (route.startsWith(prefix + '/')) {
    selected[route] = Object.keys(operations).filter((method) => ['get', 'post', 'put', 'patch', 'delete'].includes(method));
  }
}
for (const [route, methods] of Object.entries(selected)) {
  paths[route] = {};
  for (const method of methods) {
    const operation = source.paths?.[route]?.[method];
    if (!operation) throw new Error(`Missing contract: ${method} ${route}`);
    paths[route][method] = operation;
  }
}
const schemas = {};
function collectReferences(value) {
  if (!value || typeof value !== 'object') return;
  if (typeof value.$ref === 'string' && value.$ref.startsWith('#/components/schemas/')) {
    const name = value.$ref.split('/').pop();
    if (!(name in schemas)) {
      const schema = source.components?.schemas?.[name];
      if (!schema) throw new Error(`Missing schema: ${name}`);
      schemas[name] = schema;
      collectReferences(schema);
    }
  }
  for (const child of Object.values(value)) collectReferences(child);
}
collectReferences(paths);
const document = { openapi: source.openapi, info: source.info, paths, components: { schemas, securitySchemes: source.components?.securitySchemes ?? {} } };
const nodes = await openapiTS(document);
const file = ts.factory.updateSourceFile(ts.createSourceFile('schema.ts', '', ts.ScriptTarget.Latest), nodes);
const output = ts.createPrinter({ removeComments: true }).printFile(file);
const destination = new URL('../packages/api-client/src/schema.ts', import.meta.url);
await mkdir(new URL('.', destination), { recursive: true });
await writeFile(destination, output, 'utf8');
console.log(`Generated types for ${Object.keys(paths).length} paths, including PC scan login.`);
