# @klero/react-native

React Native SDK for displaying Klero surveys and feedback widgets in your mobile app.

## Installation

```bash
npm install @klero/react-native react-native-webview
# or
yarn add @klero/react-native react-native-webview
```

### iOS Setup

```bash
cd ios && pod install
```

### Android Setup

No additional setup required.

## Usage

### Embed Any Module

Use `KleroEmbed` or convenience components to display any Klero module:

```tsx
import {
  KleroEmbed,
  KleroFeedback,
  KleroRoadmap,
  KleroChangelog,
  KleroWidget,
} from '@klero/react-native';

// Generic component
<KleroEmbed projectSlug="myproject" embedType="feedback" />

// Convenience components
<KleroFeedback projectSlug="myproject" />
<KleroRoadmap projectSlug="myproject" />
<KleroChangelog projectSlug="myproject" />
<KleroWidget
  projectSlug="myproject"
  onWidgetOpened={() => console.log('opened')}
  onWidgetClosed={() => console.log('closed')}
/>
```

With programmatic control:

```tsx
import { useRef } from 'react';
import { KleroFeedback, KleroEmbedHandle } from '@klero/react-native';

const ref = useRef<KleroEmbedHandle>(null);
<KleroFeedback ref={ref} projectSlug="myproject" />

// Reload
ref.current?.reload();
```

### Basic Survey

```tsx
import { KleroSurvey } from '@klero/react-native';

function App() {
  return (
    <KleroSurvey
      projectSlug="myproject"
      surveyUlid="01ABC123..."
      onComplete={(data) => {
        console.log('Survey completed:', data.responseUlid);
        console.log('Answers:', data.answers);
      }}
      onClose={(data) => {
        console.log('Survey closed, completed:', data.completed);
      }}
      onError={(error) => {
        console.error('Survey error:', error);
      }}
    />
  );
}
```

### With Ref for Programmatic Control

```tsx
import { useRef } from 'react';
import { Button, View } from 'react-native';
import { KleroSurvey, KleroSurveyHandle } from '@klero/react-native';

function App() {
  const surveyRef = useRef<KleroSurveyHandle>(null);

  const openSurvey = () => {
    surveyRef.current?.open();
  };

  const closeSurvey = () => {
    surveyRef.current?.close();
  };

  return (
    <View style={{ flex: 1 }}>
      <Button title="Open Survey" onPress={openSurvey} />
      <Button title="Close Survey" onPress={closeSurvey} />

      <KleroSurvey
        ref={surveyRef}
        projectSlug="myproject"
        surveyUlid="01ABC123..."
        onComplete={(data) => {
          console.log('Survey completed!');
        }}
      />
    </View>
  );
}
```

### With Customer Token

```tsx
import { KleroSurvey } from '@klero/react-native';

function App() {
  return (
    <KleroSurvey
      projectSlug="myproject"
      surveyUlid="01ABC123..."
      customerToken="user-token-123"
      onComplete={(data) => {
        // Response is linked to the customer
      }}
    />
  );
}
```

### Custom Base URL

For self-hosted or custom domain setups:

```tsx
import { KleroSurvey } from '@klero/react-native';

function App() {
  return (
    <KleroSurvey
      projectSlug="myproject"
      baseUrl="https://feedback.mycompany.com"
      surveyUlid="01ABC123..."
    />
  );
}
```

## API Reference

### KleroEmbed Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `projectSlug` | `string` | Yes | Your Klero project slug |
| `embedType` | `KleroEmbedType` | Yes | Module type (`feedback`, `roadmap`, `changelog`, `widget`, `survey`) |
| `baseUrl` | `string` | No | Custom base URL |
| `customerToken` | `string` | No | Token to identify the customer |
| `embedConfig` | `Record<string, unknown>` | No | Additional config for the embed |
| `style` | `ViewStyle` | No | Custom container styles |
| `onWidgetOpened` | `() => void` | No | Widget panel opened |
| `onWidgetClosed` | `() => void` | No | Widget panel closed |
| `onLoad` | `() => void` | No | WebView finished loading |

### KleroEmbedHandle Methods

| Method | Description |
|--------|-------------|
| `reload()` | Reload the embed |

### Convenience Components

| Component | Equivalent |
|-----------|------------|
| `KleroFeedback` | `<KleroEmbed embedType="feedback" />` |
| `KleroRoadmap` | `<KleroEmbed embedType="roadmap" />` |
| `KleroChangelog` | `<KleroEmbed embedType="changelog" />` |
| `KleroWidget` | `<KleroEmbed embedType="widget" />` |

### KleroSurvey Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `projectSlug` | `string` | Yes | Your Klero project slug |
| `surveyUlid` | `string` | Yes | The survey's unique identifier |
| `baseUrl` | `string` | No | Custom base URL (default: `https://{projectSlug}.klero.ai`) |
| `customerToken` | `string` | No | Token to identify the customer |
| `style` | `ViewStyle` | No | Custom styles for the container |
| `onComplete` | `(data: SurveyCompletedEvent) => void` | No | Called when survey is submitted |
| `onClose` | `(data: SurveyClosedEvent) => void` | No | Called when survey is closed |
| `onError` | `(error: string) => void` | No | Called when survey fails to load |
| `onLoad` | `() => void` | No | Called when WebView finishes loading |

### KleroSurveyHandle Methods

| Method | Description |
|--------|-------------|
| `open(surveyUlid?: string)` | Open the survey (optionally with a different ULID) |
| `close()` | Close the survey |

### Event Types

#### SurveyCompletedEvent

```ts
interface SurveyCompletedEvent {
  surveyUlid: string;
  responseUlid: string;
  answers: Record<string, unknown>;
}
```

#### SurveyClosedEvent

```ts
interface SurveyClosedEvent {
  surveyUlid: string;
  completed: boolean;
}
```

## useKleroEvents Hook

For more granular event handling:

```tsx
import { useEffect } from 'react';
import { useKleroEvents } from '@klero/react-native';

function App() {
  const { on } = useKleroEvents();

  useEffect(() => {
    const unsubscribe = on('survey:completed', (data) => {
      console.log('Survey completed:', data.responseUlid);
    });

    return unsubscribe;
  }, [on]);

  // ...
}
```

## Requirements

- React Native >= 0.60.0
- react-native-webview >= 11.0.0

## License

MIT
