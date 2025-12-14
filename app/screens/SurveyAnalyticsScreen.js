import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../supabaseClient';
import {
    SURVEYS_API_URL,
    SURVEY_RESPONSES_API_URL,
    API_HEADERS,
    formatApiErrorMessage,
} from '../../config';

const FALLBACK_ANALYTICS = {
    surveyTitle: 'Overall Performance',
    summary: {
        responseRate: 78,
        totalResponses: 0,
        averageTime: '3m 25s',
        dropOffRate: 12,
        rewardSpend: 0,
        mobileShare: 62,
    },
    audience: [
        { label: '18-24', value: 110 },
        { label: '25-34', value: 78 },
        { label: '35-44', value: 42 },
        { label: '45+', value: 18 },
    ],
    channelPerformance: [
        { label: 'Mon', value: 12 },
        { label: 'Tue', value: 18 },
        { label: 'Wed', value: 25 },
        { label: 'Thu', value: 14 },
    ],
    completionJourney: [
        { label: 'Started', value: 100 },
        { label: 'Mid Survey', value: 84 },
        { label: 'Completed', value: 78 },
    ],
    insights: [
        {
            icon: 'target-account',
            title: 'Best Performing Segment',
            body: 'Female respondents aged 18-24 complete 92% of surveys once they start.',
        },
        {
            icon: 'cellphone-information',
            title: 'Device Trend',
            body: 'Mobile devices contribute 62% of all submissions. Desktop completion time is 40s faster.',
        },
        {
            icon: 'chart-box-outline',
            title: 'Reward Efficiency',
            body: 'Average reward spend per completed response is Rs 16.6, below the Rs 20 target.',
        },
    ],
};

const parseJsonArray = (raw) => {
    if (!raw && raw !== 0) {
        return [];
    }
    if (Array.isArray(raw)) {
        return raw;
    }
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    if (typeof raw === 'object') {
        if (Array.isArray(raw.answers)) {
            return raw.answers;
        }
        return Object.values(raw);
    }
    return [];
};

const parseQuestions = (raw) => {
    if (!raw && raw !== 0) {
        return [];
    }
    if (Array.isArray(raw)) {
        return raw;
    }
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : Object.values(parsed || {});
        } catch {
            return [];
        }
    }
    if (typeof raw === 'object') {
        return Array.isArray(raw.questions) ? raw.questions : Object.values(raw);
    }
    return [];
};

const findAnswerForQuestion = (answers, question) => {
    if (!question || !Array.isArray(answers)) {
        return null;
    }
    const questionId = question.id ?? question.questionId;
    let match = null;

    if (questionId !== undefined && questionId !== null) {
        match = answers.find((answer) => {
            const answerId = answer?.questionId ?? answer?.question_id;
            return answerId === questionId || `${answerId}` === `${questionId}`;
        });
    }

    if (!match && question.questionText) {
        match = answers.find((answer) => {
            const answerText = answer?.questionText ?? answer?.question_text;
            return answerText && answerText === question.questionText;
        });
    }

    return match?.answer ?? match?.value ?? match?.response ?? null;
};

const buildDistributionFromQuestion = (question, responses) => {
    if (!question) {
        return [];
    }
    const counts = {};
    responses.forEach((response) => {
        const answer = findAnswerForQuestion(response.parsedAnswers, question);
        if (Array.isArray(answer)) {
            answer.forEach((value) => {
                const label = `${value}`.trim();
                if (!label) {
                    return;
                }
                counts[label] = (counts[label] || 0) + 1;
            });
        } else if (answer !== null && answer !== undefined) {
            const label = `${answer}`.trim();
            if (!label) {
                return;
            }
            counts[label] = (counts[label] || 0) + 1;
        }
    });
    return Object.entries(counts)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 4);
};

const buildDeviceBreakdown = (responses) => {
    if (!responses.length) {
        return [];
    }
    const buckets = {
        Android: 0,
        iOS: 0,
        Web: 0,
        Other: 0,
    };

    responses.forEach((response) => {
        const info = `${response.device_info || ''}`.toLowerCase();
        if (!info) {
            buckets.Other += 1;
            return;
        }
        if (info.includes('android')) {
            buckets.Android += 1;
        } else if (info.includes('ios') || info.includes('iphone') || info.includes('ipad')) {
            buckets.iOS += 1;
        } else if (info.includes('mac') || info.includes('win') || info.includes('web')) {
            buckets.Web += 1;
        } else {
            buckets.Other += 1;
        }
    });

    return Object.entries(buckets)
        .filter(([, value]) => value > 0)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 4);
};

const buildTimeline = (responses) => {
    if (!responses.length) {
        return [];
    }
    const map = new Map();
    responses.forEach((response) => {
        const rawDate = response.completed_at || response.created_at || response.inserted_at;
        if (!rawDate) {
            return;
        }
        const date = new Date(rawDate);
        if (Number.isNaN(date.getTime())) {
            return;
        }
        const key = date.toISOString().slice(0, 10);
        const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const entry = map.get(key) || { label, value: 0 };
        entry.value += 1;
        map.set(key, entry);
    });

    return Array.from(map.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([, value]) => value)
        .slice(-6);
};

const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) {
        return '—';
    }
    const rounded = Math.round(seconds);
    const minutes = Math.floor(rounded / 60);
    const remainingSeconds = rounded % 60;
    if (minutes === 0) {
        return `${remainingSeconds}s`;
    }
    return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
};

const computeMobileShare = (responses) => {
    if (!responses.length) {
        return 0;
    }
    const mobileCount = responses.filter((response) => {
        const info = `${response.device_info || ''}`.toLowerCase();
        if (!info) {
            return false;
        }
        return info.includes('android') || info.includes('ios') || info.includes('iphone') || info.includes('ipad');
    }).length;
    return Math.round((mobileCount / responses.length) * 100);
};

const buildCompletionJourney = (completionRate) => {
    const completed = Math.max(0, Math.min(100, completionRate));
    const mid = completed >= 100 ? 100 : Math.max(completed, Math.round((completed + 100) / 2));
    return [
        { label: 'Started', value: 100 },
        { label: 'Mid Survey', value: mid },
        { label: 'Completed', value: completed },
    ];
};

const buildInsights = (summary, topAudience, timeline) => {
    const insights = [];

    if (topAudience && summary.totalResponses) {
        const percent = Math.round((topAudience.value / summary.totalResponses) * 100);
        insights.push({
            icon: 'target-account',
            title: 'Leading Segment',
            body: `${topAudience.label} accounts for ${percent}% of completions.`,
        });
    }

    if (summary.averageTime && summary.averageTime !== '—') {
        insights.push({
            icon: 'timer-sand',
            title: 'Completion Speed',
            body: `Average time to finish is ${summary.averageTime}.`,
        });
    }

    insights.push({
        icon: 'cellphone-information',
        title: 'Device Mix',
        body: `${summary.mobileShare}% of responses were submitted on mobile devices.`,
    });

    if (summary.totalResponses) {
        const perResponse = summary.rewardSpend && summary.rewardSpend > 0
            ? (summary.rewardSpend / summary.totalResponses).toFixed(1)
            : '0.0';
        insights.push({
            icon: 'chart-box-outline',
            title: 'Reward Efficiency',
            body: summary.rewardSpend
                ? `Rs ${summary.rewardSpend.toFixed(0)} spent (~Rs ${perResponse} per completion).`
                : 'No reward spend recorded for this survey yet.',
        });
    }

    if (timeline && timeline.length) {
        const latest = timeline[timeline.length - 1];
        insights.push({
            icon: 'calendar-clock',
            title: 'Latest Activity',
            body: `${latest.label} added ${latest.value} new response${latest.value === 1 ? '' : 's'}.`,
        });
    }

    return insights.slice(0, 4);
};

const computeAnalyticsPayload = (survey, responses, fallbackTitle) => {
    const normalizedResponses = responses.map((response) => ({
        ...response,
        parsedAnswers: parseJsonArray(response.response_data),
    }));

    const recordedCount = Number(
        survey?.responses_collected ??
        survey?.responsesCollected ??
        0,
    );
    const totalResponses = normalizedResponses.length || recordedCount;
    const targetResponses = Number(
        survey?.total_responses ??
        survey?.totalResponses ??
        recordedCount,
    ) || totalResponses;
    const completionRate = targetResponses
        ? Math.min(100, Math.round((totalResponses / targetResponses) * 100))
        : totalResponses > 0 ? 100 : 0;
    const averageSeconds = totalResponses
        ? normalizedResponses.reduce((sum, response) => sum + Number(response.time_taken_seconds || 0), 0) /
          totalResponses
        : 0;
    const rewardSpend = normalizedResponses.reduce(
        (sum, response) => sum + Number(response.reward_amount || 0),
        0,
    );

    const summary = {
        responseRate: completionRate,
        totalResponses,
        averageTime: formatDuration(averageSeconds),
        dropOffRate: Math.max(0, 100 - completionRate),
        rewardSpend,
        mobileShare: computeMobileShare(normalizedResponses),
    };

    const questions = parseQuestions(survey?.questions);
    const audienceQuestion = questions.find(
        (question) =>
            question &&
            ['multiple_choice', 'dropdown', 'checkboxes', 'radio_choice'].includes(question.questionType),
    );
    let audience = buildDistributionFromQuestion(audienceQuestion, normalizedResponses);
    if (!audience.length) {
        audience = buildDeviceBreakdown(normalizedResponses);
    }

    const timeline = buildTimeline(normalizedResponses);
    const completionJourney = buildCompletionJourney(completionRate || 0);
    const insights = buildInsights(summary, audience[0], timeline);

    const safeAudience = audience.length ? audience : [{ label: 'No responses yet', value: 0 }];
    const safeTimeline = timeline.length ? timeline : [{ label: 'No activity', value: 0 }];
    const safeInsights = insights.length
        ? insights
        : [{
            icon: 'information-outline',
            title: 'Waiting for Responses',
            body: 'Publish or promote your survey to unlock analytics insights.',
        }];

    return {
        surveyTitle: survey?.title || fallbackTitle || FALLBACK_ANALYTICS.surveyTitle,
        summary: {
            ...summary,
            averageTime: summary.averageTime || FALLBACK_ANALYTICS.summary.averageTime,
        },
        audience: safeAudience,
        channelPerformance: safeTimeline,
        completionJourney: completionJourney.length ? completionJourney : FALLBACK_ANALYTICS.completionJourney,
        insights: safeInsights,
    };
};

const StatPill = ({ label, value, accent }) => (
    <LinearGradient colors={accent} style={styles.statPill}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </LinearGradient>
);

const HorizontalBar = ({ label, value, max = 100 }) => {
    const widthPercent = Math.min(100, max ? (value / max) * 100 : 0);
    return (
        <View style={styles.barRow}>
            <View style={styles.barLabelRow}>
                <Text style={styles.barLabel}>{label}</Text>
                <Text style={styles.barValue}>{value}</Text>
            </View>
            <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${widthPercent}%` }]} />
            </View>
        </View>
    );
};

const FunnelStep = ({ label, value, first }) => (
    <View style={styles.funnelStep}>
        {!first && <View style={styles.funnelConnector} />}
        <LinearGradient colors={['#FFB347', '#FFCC33']} style={styles.funnelBadge}>
            <Text style={styles.funnelValue}>{value}%</Text>
        </LinearGradient>
        <Text style={styles.funnelLabel}>{label}</Text>
    </View>
);

const SurveyAnalyticsScreen = ({ navigation, route }) => {
    const [analytics, setAnalytics] = useState(FALLBACK_ANALYTICS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [fetchNonce, setFetchNonce] = useState(0);

    const surveyId = route?.params?.surveyId;
    const surveyTitleParam = route?.params?.surveyTitle;

    useEffect(() => {
        let isMounted = true;

        const fetchAnalytics = async () => {
            if (!surveyId) {
                setAnalytics((prev) => ({
                    ...prev,
                    surveyTitle: surveyTitleParam || prev.surveyTitle,
                }));
                setError('Select a published survey to view its live analytics.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError('');

                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError || !session) {
                    throw new Error('Session expired. Please sign in again.');
                }

                const token = session.access_token;
                const creatorId = session.user.id;
                const encodedSurveyId = encodeURIComponent(surveyId);
                const encodedCreatorId = encodeURIComponent(creatorId);

                const surveyResponse = await fetch(
                    `${SURVEYS_API_URL}?select=*&id=eq.${encodedSurveyId}&user_id=eq.${encodedCreatorId}`,
                    {
                        method: 'GET',
                        headers: API_HEADERS(token),
                    },
                );

                if (!surveyResponse.ok) {
                    throw new Error(await formatApiErrorMessage(surveyResponse));
                }

                const surveyPayload = await surveyResponse.json();
                const surveyRecord = surveyPayload?.[0];

                if (!surveyRecord) {
                    throw new Error('Survey not found or you do not have access.');
                }

                const responsesResponse = await fetch(
                    `${SURVEY_RESPONSES_API_URL}?select=*&survey_id=eq.${encodedSurveyId}`,
                    {
                        method: 'GET',
                        headers: API_HEADERS(token),
                    },
                );

                if (!responsesResponse.ok) {
                    throw new Error(await formatApiErrorMessage(responsesResponse));
                }

                const responsesData = await responsesResponse.json();
                const computed = computeAnalyticsPayload(surveyRecord, responsesData, surveyTitleParam);

                if (isMounted) {
                    setAnalytics(computed);
                    setError('');
                }
            } catch (fetchError) {
                console.error('Failed to load analytics:', fetchError);
                if (isMounted) {
                    setError(fetchError.message || 'Unable to load analytics data.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchAnalytics();

        return () => {
            isMounted = false;
        };
    }, [surveyId, surveyTitleParam, fetchNonce]);

    const summary = analytics.summary || FALLBACK_ANALYTICS.summary;
    const maxAudienceValue = Math.max(
        1,
        ...analytics.audience.map((item) => Number(item.value) || 0),
    );
    const maxTimelineValue = Math.max(
        1,
        ...analytics.channelPerformance.map((item) => Number(item.value) || 0),
    );

    const handleRetry = () => setFetchNonce((prev) => prev + 1);
    const handlePickSurvey = () => navigation.navigate('PublishedSurveysScreen');

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#FF7E1D', '#FFD464']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Survey Analytics</Text>
                <Text style={styles.headerSubtitle}>{analytics.surveyTitle}</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {error ? (
                    <View style={styles.errorBanner}>
                        <MaterialIcons name="info" size={20} color="#B7410E" />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity
                            style={styles.errorButton}
                            onPress={surveyId ? handleRetry : handlePickSurvey}
                        >
                            <Text style={styles.errorButtonText}>{surveyId ? 'Retry' : 'Pick Survey'}</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}

                {loading ? (
                    <View style={styles.loadingState}>
                        <ActivityIndicator size="large" color="#FF7E1D" />
                        <Text style={styles.loadingInlineText}>Crunching live responses...</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.statRow}>
                            <StatPill label="Response Rate" value={`${summary.responseRate}%`} accent={['#FF845B', '#FFB75E']} />
                            <StatPill label="Responses" value={summary.totalResponses} accent={['#4E54C8', '#8F94FB']} />
                        </View>

                        <View style={styles.statRow}>
                            <StatPill label="Avg Time" value={summary.averageTime} accent={['#00B4DB', '#0083B0']} />
                            <StatPill label="Drop-off" value={`${summary.dropOffRate}%`} accent={['#F857A6', '#FF5858']} />
                        </View>

                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <MaterialCommunityIcons name="account-group" size={22} color="#FF7E1D" />
                                <Text style={styles.cardTitle}>Audience Breakdown</Text>
                            </View>
                            {analytics.audience.map((item) => (
                                <HorizontalBar key={item.label} label={item.label} value={item.value} max={maxAudienceValue} />
                            ))}
                        </View>

                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <MaterialCommunityIcons name="timeline-text-outline" size={22} color="#FF7E1D" />
                                <Text style={styles.cardTitle}>Response Timeline</Text>
                            </View>
                            {analytics.channelPerformance.map((item) => (
                                <HorizontalBar key={item.label} label={item.label} value={item.value} max={maxTimelineValue} />
                            ))}
                        </View>

                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <MaterialCommunityIcons name="chart-arc" size={22} color="#FF7E1D" />
                                <Text style={styles.cardTitle}>Completion Journey</Text>
                            </View>
                            <View style={styles.funnelContainer}>
                                {analytics.completionJourney.map((step, index) => (
                                    <FunnelStep key={step.label} label={step.label} value={step.value} first={index === 0} />
                                ))}
                            </View>
                        </View>

                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <MaterialCommunityIcons name="lightbulb-on-outline" size={22} color="#FF7E1D" />
                                <Text style={styles.cardTitle}>Key Insights</Text>
                            </View>
                            {analytics.insights.map((insight) => (
                                <View key={insight.title} style={styles.insightRow}>
                                    <LinearGradient colors={['#FF7E1D', '#FFD464']} style={styles.insightIcon}>
                                        <MaterialCommunityIcons name={insight.icon} size={20} color="#fff" />
                                    </LinearGradient>
                                    <View style={styles.insightTextContainer}>
                                        <Text style={styles.insightTitle}>{insight.title}</Text>
                                        <Text style={styles.insightBody}>{insight.body}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        <View style={styles.bottomSpacer} />
                    </>
                )}
            </ScrollView>
        </View>
    );
};

export default SurveyAnalyticsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDF7F0',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    headerTitle: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 5,
    },
    scrollContent: {
        padding: 20,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFE8D6',
        borderRadius: 14,
        padding: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FFB47D',
    },
    errorText: {
        flex: 1,
        marginHorizontal: 10,
        color: '#8B3A0E',
        fontSize: 13,
        lineHeight: 18,
    },
    errorButton: {
        backgroundColor: '#FF7E1D',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    errorButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    loadingState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    loadingInlineText: {
        marginTop: 12,
        color: '#555',
        fontSize: 14,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    statPill: {
        flex: 1,
        marginHorizontal: 5,
        paddingVertical: 16,
        borderRadius: 18,
        alignItems: 'center',
        shadowColor: '#FF7E1D',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    statLabel: {
        marginTop: 4,
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    cardTitle: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    barRow: {
        marginBottom: 12,
    },
    barLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    barLabel: {
        fontSize: 13,
        color: '#555',
    },
    barValue: {
        fontSize: 13,
        color: '#FF7E1D',
        fontWeight: '600',
    },
    barTrack: {
        height: 8,
        backgroundColor: '#F3E8DD',
        borderRadius: 10,
        marginTop: 6,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 10,
        backgroundColor: '#FF9A62',
    },
    funnelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    funnelStep: {
        alignItems: 'center',
        flex: 1,
    },
    funnelConnector: {
        width: '100%',
        height: 2,
        backgroundColor: '#FFE1C1',
        marginBottom: 8,
    },
    funnelBadge: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 16,
        shadowColor: '#FFB347',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 3,
    },
    funnelValue: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    funnelLabel: {
        marginTop: 8,
        fontSize: 12,
        color: '#555',
    },
    insightRow: {
        flexDirection: 'row',
        marginBottom: 18,
    },
    insightIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        shadowColor: '#FF7E1D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },
    insightTextContainer: {
        flex: 1,
    },
    insightTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
    },
    insightBody: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
        lineHeight: 18,
    },
    bottomSpacer: {
        height: 40,
    },
});
