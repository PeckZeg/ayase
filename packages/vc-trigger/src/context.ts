import { InjectionKey } from 'vue';

interface TriggerContextProps {
  onPopupMouseDown: (event: MouseEvent) => void;
}

const TriggerContext: InjectionKey<TriggerContextProps> = Symbol();

export default TriggerContext;
