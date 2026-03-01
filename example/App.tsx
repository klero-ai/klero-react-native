/**
 * Klero React Native SDK Example App
 *
 * Demonstrates all Klero embed types: Feedback, Roadmap, Changelog, Widget, and Survey.
 * Matches the iOS and Android example apps.
 */

import React, {useRef, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  KleroEmbed,
  KleroEmbedHandle,
  KleroSurvey,
  KleroSurveyHandle,
} from '@kleroai/react-native';

// Config matching iOS and Android examples
const PROJECT_SLUG = 'feedback';
const BASE_URL = 'https://feedback.klero.ai';
const SURVEY_ULID = '01KHRJEJDBP6T3PZZ7XFS5935Y';

type TabId = 'feedback' | 'roadmap' | 'changelog' | 'widget' | 'survey';

interface TabDef {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: TabDef[] = [
  {id: 'feedback', label: 'Feedback', icon: '💬'},
  {id: 'roadmap', label: 'Roadmap', icon: '🗺'},
  {id: 'changelog', label: 'Changelog', icon: '📰'},
  {id: 'widget', label: 'Widget', icon: '⭐'},
  {id: 'survey', label: 'Survey', icon: '📋'},
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('feedback');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {activeTab === 'feedback' && (
          <EmbedTab
            embedType="feedback"
            title="Feedback Board"
            description="View and submit feature requests, bug reports, and ideas."
          />
        )}
        {activeTab === 'roadmap' && (
          <EmbedTab
            embedType="roadmap"
            title="Product Roadmap"
            description="See what's planned, in progress, and completed."
          />
        )}
        {activeTab === 'changelog' && (
          <EmbedTab
            embedType="changelog"
            title="Changelog"
            description="Stay up to date with the latest product updates."
          />
        )}
        {activeTab === 'widget' && <WidgetTab />}
        {activeTab === 'survey' && <SurveyTab />}
      </View>

      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}>
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.id && styles.tabLabelActive,
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

function EmbedTab({
  embedType,
  title,
  description,
}: {
  embedType: 'feedback' | 'roadmap' | 'changelog';
  title: string;
  description: string;
}) {
  const [showEmbed, setShowEmbed] = useState(false);
  const embedRef = useRef<KleroEmbedHandle>(null);

  if (showEmbed) {
    return (
      <KleroEmbed
        ref={embedRef}
        projectSlug={PROJECT_SLUG}
        baseUrl={BASE_URL}
        embedType={embedType}
        style={styles.flex}
      />
    );
  }

  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderDesc}>{description}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowEmbed(true)}>
        <Text style={styles.buttonText}>Open {title}</Text>
      </TouchableOpacity>
    </View>
  );
}

function WidgetTab() {
  const [showWidget, setShowWidget] = useState(false);
  const [events, setEvents] = useState<string[]>([]);

  const addEvent = (event: string) => {
    setEvents(prev => [
      `${new Date().toLocaleTimeString()}: ${event}`,
      ...prev,
    ]);
  };

  return (
    <View style={styles.flex}>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderTitle}>In-App Widget</Text>
        <Text style={styles.placeholderDesc}>
          A floating widget that provides quick access to feedback, roadmap, and
          changelog.
        </Text>
        <TouchableOpacity
          style={[styles.button, showWidget && styles.dangerButton]}
          onPress={() => setShowWidget(!showWidget)}>
          <Text style={styles.buttonText}>
            {showWidget ? 'Remove Widget' : 'Show Widget'}
          </Text>
        </TouchableOpacity>

        {events.length > 0 && (
          <EventLog events={events} onClear={() => setEvents([])} />
        )}
      </View>

      {showWidget && (
        <KleroEmbed
          projectSlug={PROJECT_SLUG}
          baseUrl={BASE_URL}
          embedType="widget"
          style={StyleSheet.absoluteFill}
          onWidgetOpened={() => addEvent('Widget opened')}
          onWidgetClosed={() => addEvent('Widget closed')}
        />
      )}
    </View>
  );
}

function SurveyTab() {
  const [showSurvey, setShowSurvey] = useState(false);
  const surveyRef = useRef<KleroSurveyHandle>(null);
  const [events, setEvents] = useState<string[]>([]);

  const addEvent = (event: string) => {
    setEvents(prev => [
      `${new Date().toLocaleTimeString()}: ${event}`,
      ...prev,
    ]);
  };

  return (
    <View style={styles.flex}>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderTitle}>Surveys</Text>
        <Text style={styles.placeholderDesc}>
          Run targeted surveys to collect structured feedback from your users.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowSurvey(true)}>
          <Text style={styles.buttonText}>Open Survey</Text>
        </TouchableOpacity>

        {events.length > 0 && (
          <EventLog events={events} onClear={() => setEvents([])} />
        )}
      </View>

      {showSurvey && (
        <KleroSurvey
          ref={surveyRef}
          projectSlug={PROJECT_SLUG}
          baseUrl={BASE_URL}
          surveyUlid={SURVEY_ULID}
          style={StyleSheet.absoluteFill}
          onComplete={data => {
            addEvent(`Survey completed: ${data.responseUlid}`);
          }}
          onClose={data => {
            addEvent(`Survey closed (completed: ${data.completed})`);
            setShowSurvey(false);
          }}
          onError={error => {
            addEvent(`Error: ${error}`);
          }}
        />
      )}
    </View>
  );
}

function EventLog({
  events,
  onClear,
}: {
  events: string[];
  onClear: () => void;
}) {
  return (
    <View style={styles.eventSection}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>Event Log</Text>
        <TouchableOpacity onPress={onClear}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.eventLog}>
        {events.map((event, index) => (
          <Text key={index} style={styles.eventText}>
            {event}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabActive: {},
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
  tabLabelActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },

  // Placeholder / landing
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  placeholderDesc: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },

  // Buttons
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Event log
  eventSection: {
    width: '100%',
    marginTop: 24,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  clearText: {
    fontSize: 12,
    color: '#ef4444',
  },
  eventLog: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    maxHeight: 120,
  },
  eventText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
});
