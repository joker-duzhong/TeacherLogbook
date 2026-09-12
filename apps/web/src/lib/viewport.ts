import { onBeforeUnmount, ref } from 'vue';

export function useCompactViewport() {
  const media = window.matchMedia('(max-width: 760px)');
  const compact = ref(media.matches);
  const update = () => { compact.value = media.matches; };
  media.addEventListener('change', update);
  onBeforeUnmount(() => media.removeEventListener('change', update));
  return compact;
}
