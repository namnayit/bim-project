// directives/clickOutside.ts
import { DirectiveBinding } from "vue";

export default {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
        el.clickOutsideEvent = (event: Event) => {
            if (!(el === event.target || el.contains(event.target as Node))) {
                binding.value(event);
            }
        };
        document.addEventListener("click", el.clickOutsideEvent);
    },
    unmounted(el: HTMLElement) {
        document.removeEventListener("click", el.clickOutsideEvent);
    },
};
