/**
 * Klero React Native SDK
 *
 * Display Klero surveys and feedback widgets in your React Native app.
 *
 * @example
 * ```tsx
 * import { KleroSurvey } from '@kleroai/react-native';
 *
 * function App() {
 *   return (
 *     <KleroSurvey
 *       projectSlug="myproject"
 *       surveyUlid="01ABC123..."
 *       onComplete={(data) => {
 *         console.log('Survey completed:', data.responseUlid);
 *       }}
 *     />
 *   );
 * }
 * ```
 *
 * @packageDocumentation
 */

// Components
export { KleroSurvey } from './KleroSurvey';
export type { KleroSurveyProps, KleroSurveyHandle } from './KleroSurvey';

export {
  KleroEmbed,
  KleroFeedback,
  KleroRoadmap,
  KleroChangelog,
  KleroWidget,
} from './KleroEmbed';
export type { KleroEmbedProps, KleroEmbedHandle } from './KleroEmbed';

// Hooks
export { useKleroEvents } from './useKleroEvents';

// Types
export type {
  KleroConfig,
  KleroEmbedType,
  SurveyCompletedEvent,
  SurveyClosedEvent,
  SurveyErrorEvent,
  FeedbackSubmittedEvent,
  WidgetOpenedEvent,
  WidgetClosedEvent,
  KleroEventMap,
  KleroMessage,
} from './types';
