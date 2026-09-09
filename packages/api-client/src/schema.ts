export interface paths {
    "/api/v1/auth/sms/send": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["send_sms_api_v1_auth_sms_send_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/phone/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["phone_login_api_v1_auth_phone_login_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/miniapp/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["miniapp_login_api_v1_auth_miniapp_login_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["refresh_token_api_v1_auth_refresh_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_me_api_v1_auth_me_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/scan/apps": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_scan_apps_api_v1_auth_scan_apps_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/scan/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["create_scan_session_api_v1_auth_scan_sessions_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/scan/sessions/{transaction_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["poll_scan_session_api_v1_auth_scan_sessions__transaction_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/scan/exchange": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["exchange_scan_api_v1_auth_scan_exchange_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_classes_api_v1_teacher_logbook_classes_get"];
        put?: never;
        post: operations["create_class_api_v1_teacher_logbook_classes_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/students": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["list_students_api_v1_teacher_logbook_classes__class_id__students_get"];
        put?: never;
        post: operations["create_student_api_v1_teacher_logbook_classes__class_id__students_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/teacher-logbook/classes/{class_id}/students/{student_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_student_api_v1_teacher_logbook_classes__class_id__students__student_id__get"];
        put?: never;
        post?: never;
        delete: operations["delete_student_api_v1_teacher_logbook_classes__class_id__students__student_id__delete"];
        options?: never;
        head?: never;
        patch: operations["update_student_api_v1_teacher_logbook_classes__class_id__students__student_id__patch"];
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        SendSmsRequest: {
            phone: string;
        };
        ResponseModel: {
            code: number;
            message: string;
            data?: unknown | null;
        };
        HTTPValidationError: {
            detail?: components["schemas"]["ValidationError"][];
        };
        ValidationError: {
            loc: (string | number)[];
            msg: string;
            type: string;
            input?: unknown;
            ctx?: Record<string, never>;
        };
        PhoneLoginRequest: {
            phone: string;
            code: string;
        };
        ResponseModel_LoginResponse_: {
            code: number;
            message: string;
            data?: components["schemas"]["LoginResponse"] | null;
        };
        LoginResponse: {
            access_token: string;
            refresh_token: string;
            token_type: string;
            user: components["schemas"]["UserResponse"];
        };
        UserResponse: {
            nickname?: string | null;
            avatar?: components["schemas"]["UserAvatarResponse"] | null;
            id: string;
            openid?: string | null;
            username?: string | null;
            email?: string | null;
            phone?: string | null;
            source: string | null;
            is_active: boolean | null;
            is_superuser: boolean | null;
            roles: components["schemas"]["RoleInfo"][];
            created_at?: string | null;
            updated_at?: string | null;
            readonly needs_phone_binding: boolean;
        };
        UserAvatarResponse: {
            id?: string | null;
            name?: string | null;
            url: string;
            thumb_url?: string | null;
            size?: number | null;
            type?: string | null;
            scope?: string | null;
            hash?: string | null;
            owner?: string | null;
            created_at?: string | null;
            updated_at?: string | null;
        };
        RoleInfo: {
            id: string;
            name: string;
            code: string;
        };
        MiniappLoginRequest: {
            appid: string;
            code: string;
        };
        RefreshRequest: {
            refresh_token: string;
        };
        ResponseModel_Token_: {
            code: number;
            message: string;
            data?: components["schemas"]["Token"] | null;
        };
        Token: {
            access_token: string;
            refresh_token: string;
            token_type: string;
        };
        ResponseModel_UserResponse_: {
            code: number;
            message: string;
            data?: components["schemas"]["UserResponse"] | null;
        };
        ResponseModel_list_ScanAppResponse__: {
            code: number;
            message: string;
            data?: components["schemas"]["ScanAppResponse"][] | null;
        };
        ScanAppResponse: {
            app_key: string;
            name: string;
        };
        ScanCreateRequest: {
            app_key: string;
        };
        ResponseModel_ScanCreateResponse_: {
            code: number;
            message: string;
            data?: components["schemas"]["ScanCreateResponse"] | null;
        };
        ScanCreateResponse: {
            transaction_id: string;
            status: components["schemas"]["ScanStatus"];
            app?: components["schemas"]["ScanAppResponse"] | null;
            expires_at?: string | null;
            poll_token: string;
            poll_interval_seconds: number;
        };
        ScanStatus: "WAITING_SCAN" | "PENDING" | "CONFIRMED" | "CONSUMED" | "CANCELLED" | "EXPIRED";
        ResponseModel_ScanPollResponse_: {
            code: number;
            message: string;
            data?: components["schemas"]["ScanPollResponse"] | null;
        };
        ScanPollResponse: {
            transaction_id: string;
            status: components["schemas"]["ScanStatus"];
            app?: components["schemas"]["ScanAppResponse"] | null;
            expires_at?: string | null;
            exchange_code?: string | null;
        };
        ScanExchangeRequest: {
            transaction_id: string;
            exchange_code: string;
        };
        ResponseModel_list_ClassRead__: {
            code: number;
            message: string;
            data?: components["schemas"]["ClassRead"][] | null;
        };
        ClassRead: {
            name: string;
            timezone: string;
            id: string;
            createdAt: string;
            updatedAt: string;
        };
        ClassCreate: {
            name: string;
            timezone: string;
        };
        ResponseModel_ClassRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["ClassRead"] | null;
        };
        PaginatedResponse_StudentRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["PaginatedData_StudentRead_"] | null;
        };
        PaginatedData_StudentRead_: {
            items: components["schemas"]["StudentRead"][];
            total: number;
            page: number;
            page_size: number;
            total_pages: number;
        };
        StudentRead: {
            name: string;
            gender: "男" | "女" | "其他";
            contact?: string | null;
            id: string;
            classId: string;
            createdAt: string;
            updatedAt: string;
        };
        StudentCreate: {
            name: string;
            gender: "男" | "女" | "其他";
            contact?: string | null;
        };
        ResponseModel_StudentRead_: {
            code: number;
            message: string;
            data?: components["schemas"]["StudentRead"] | null;
        };
        StudentUpdate: {
            name?: string | null;
            gender?: ("男" | "女" | "其他") | null;
            contact?: string | null;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    send_sms_api_v1_auth_sms_send_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SendSmsRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    phone_login_api_v1_auth_phone_login_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PhoneLoginRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_LoginResponse_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    miniapp_login_api_v1_auth_miniapp_login_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MiniappLoginRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_LoginResponse_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    refresh_token_api_v1_auth_refresh_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_Token_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_me_api_v1_auth_me_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_UserResponse_"];
                };
            };
        };
    };
    list_scan_apps_api_v1_auth_scan_apps_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_list_ScanAppResponse__"];
                };
            };
        };
    };
    create_scan_session_api_v1_auth_scan_sessions_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ScanCreateRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_ScanCreateResponse_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    poll_scan_session_api_v1_auth_scan_sessions__transaction_id__get: {
        parameters: {
            query?: never;
            header: {
                "X-Scan-Token": string;
            };
            path: {
                transaction_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_ScanPollResponse_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    exchange_scan_api_v1_auth_scan_exchange_post: {
        parameters: {
            query?: never;
            header: {
                "X-Scan-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ScanExchangeRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_LoginResponse_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_classes_api_v1_teacher_logbook_classes_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_list_ClassRead__"];
                };
            };
        };
    };
    create_class_api_v1_teacher_logbook_classes_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ClassCreate"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_ClassRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_students_api_v1_teacher_logbook_classes__class_id__students_get: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                keyword?: string | null;
                gender?: string | null;
            };
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedResponse_StudentRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_student_api_v1_teacher_logbook_classes__class_id__students_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StudentCreate"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_StudentRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_student_api_v1_teacher_logbook_classes__class_id__students__student_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                student_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_StudentRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_student_api_v1_teacher_logbook_classes__class_id__students__student_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                student_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_student_api_v1_teacher_logbook_classes__class_id__students__student_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                class_id: string;
                student_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StudentUpdate"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseModel_StudentRead_"];
                };
            };
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
}
