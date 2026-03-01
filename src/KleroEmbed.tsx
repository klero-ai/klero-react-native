import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
} from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import type { KleroConfig, KleroEmbedType, KleroMessage } from './types';

/**
 * Props for the KleroEmbed component
 */
export interface KleroEmbedProps extends KleroConfig {
  /** The type of embed to display */
  embedType: KleroEmbedType;
  /** Additional configuration for the embed (e.g. surveyUlid, roadmapSlug) */
  embedConfig?: Record<string, unknown>;
  /** Custom styles for the container */
  style?: StyleProp<ViewStyle>;
  /** Callback when the widget is opened */
  onWidgetOpened?: () => void;
  /** Callback when the widget is closed */
  onWidgetClosed?: () => void;
  /** Callback when the WebView finishes loading */
  onLoad?: () => void;
}

/**
 * Imperative handle for the KleroEmbed component
 */
export interface KleroEmbedHandle {
  /** Reload the embed */
  reload: () => void;
}

/**
 * Escape string for safe JSON embedding in HTML
 */
function escapeForHtmlAttr(str: string): string {
  return str
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Generic Klero embed component for displaying any Klero module in React Native
 *
 * @example
 * ```tsx
 * import { KleroEmbed } from '@kleroai/react-native';
 *
 * function App() {
 *   return (
 *     <KleroEmbed
 *       projectSlug="myproject"
 *       embedType="feedback"
 *     />
 *   );
 * }
 * ```
 */
export const KleroEmbed = forwardRef<KleroEmbedHandle, KleroEmbedProps>(
  (
    {
      projectSlug,
      baseUrl,
      customerToken,
      embedType,
      embedConfig: extraConfig,
      style,
      onWidgetOpened,
      onWidgetClosed,
      onLoad,
    },
    ref
  ) => {
    const webViewRef = useRef<WebView>(null);

    const domain = baseUrl || `https://${projectSlug}.klero.ai`;

    const configObj: Record<string, unknown> = {
      projectId: projectSlug,
      baseUrl: domain,
      ...extraConfig,
    };
    if (customerToken) {
      configObj.customerToken = customerToken;
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <style>
    html, body { height: 100%; margin: 0; background: transparent; }
    klero-${embedType} { display: block; }
  </style>
  <script src="${domain}/embed/klero.js" async></script>
</head>
<body>
  <klero-${embedType} data-config='${escapeForHtmlAttr(JSON.stringify(configObj))}'></klero-${embedType}>
</body>
</html>`;

    const handleMessage = useCallback(
      (event: WebViewMessageEvent) => {
        try {
          const message = JSON.parse(
            event.nativeEvent.data
          ) as KleroMessage<unknown>;

          switch (message.type) {
            case 'klero:widget:opened':
              onWidgetOpened?.();
              break;
            case 'klero:widget:closed':
              onWidgetClosed?.();
              break;
          }
        } catch (e) {
          console.warn('Klero: Failed to parse message', e);
        }
      },
      [onWidgetOpened, onWidgetClosed]
    );

    useImperativeHandle(ref, () => ({
      reload: () => {
        webViewRef.current?.reload();
      },
    }));

    return (
      <View style={[styles.container, style]}>
        <WebView
          ref={webViewRef}
          source={{ html, baseUrl: domain }}
          onMessage={handleMessage}
          onLoad={onLoad}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          style={styles.webview}
          scrollEnabled={embedType !== 'widget'}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
);

KleroEmbed.displayName = 'KleroEmbed';

/**
 * Convenience component for displaying a Klero feedback board
 */
export const KleroFeedback = forwardRef<
  KleroEmbedHandle,
  Omit<KleroEmbedProps, 'embedType'>
>((props, ref) => <KleroEmbed ref={ref} {...props} embedType="feedback" />);
KleroFeedback.displayName = 'KleroFeedback';

/**
 * Convenience component for displaying a Klero roadmap
 */
export const KleroRoadmap = forwardRef<
  KleroEmbedHandle,
  Omit<KleroEmbedProps, 'embedType'>
>((props, ref) => <KleroEmbed ref={ref} {...props} embedType="roadmap" />);
KleroRoadmap.displayName = 'KleroRoadmap';

/**
 * Convenience component for displaying a Klero changelog
 */
export const KleroChangelog = forwardRef<
  KleroEmbedHandle,
  Omit<KleroEmbedProps, 'embedType'>
>((props, ref) => <KleroEmbed ref={ref} {...props} embedType="changelog" />);
KleroChangelog.displayName = 'KleroChangelog';

/**
 * Convenience component for displaying a Klero widget
 */
export const KleroWidget = forwardRef<
  KleroEmbedHandle,
  Omit<KleroEmbedProps, 'embedType'>
>((props, ref) => <KleroEmbed ref={ref} {...props} embedType="widget" />);
KleroWidget.displayName = 'KleroWidget';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
