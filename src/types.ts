/**
 * Klero React Native SDK Types
 */

/**
 * Configuration for Klero SDK
 */
export interface KleroConfig {
  /** The project slug (e.g., "myproject") */
  projectSlug: string;
  /** Override the base URL (defaults to https://{projectSlug}.klero.ai) */
  baseUrl?: string;
  /** Customer token for identifying the user */
  customerToken?: string;
}

/**
 * Event data when a survey is completed
 */
export interface SurveyCompletedEvent {
  /** The survey's unique identifier */
  surveyUlid: string;
  /** The response's unique identifier */
  responseUlid: string;
  /** The answers submitted */
  answers: Record<string, unknown>;
}

/**
 * Event data when a survey is closed
 */
export interface SurveyClosedEvent {
  /** The survey's unique identifier */
  surveyUlid: string;
  /** Whether the survey was completed before closing */
  completed: boolean;
}

/**
 * Event data when a survey fails to load
 */
export interface SurveyErrorEvent {
  /** The survey's unique identifier */
  surveyUlid: string;
  /** Error message */
  error: string;
}

/**
 * Event data when feedback is submitted
 */
export interface FeedbackSubmittedEvent {
  /** The feedback item's unique identifier */
  itemUlid: string;
}

/**
 * Event data when the widget is opened
 */
export interface WidgetOpenedEvent {
  /** Empty event data */
}

/**
 * Event data when the widget is closed
 */
export interface WidgetClosedEvent {
  /** Empty event data */
}

/**
 * Map of all Klero events to their data types
 */
export interface KleroEventMap {
  'survey:completed': SurveyCompletedEvent;
  'survey:closed': SurveyClosedEvent;
  'survey:error': SurveyErrorEvent;
  'feedback:submitted': FeedbackSubmittedEvent;
  'widget:opened': WidgetOpenedEvent;
  'widget:closed': WidgetClosedEvent;
}

/**
 * Embed types supported by Klero
 */
export type KleroEmbedType =
  | 'feedback'
  | 'roadmap'
  | 'changelog'
  | 'widget'
  | 'survey';

/**
 * Message received from the WebView
 */
export interface KleroMessage<T = unknown> {
  type: `klero:${string}`;
  data: T;
}
