import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    Dimensions,
    Alert,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// --------------------------------------------------------------
// 🔹 REUSABLE PLAN CARD — SQUARE DESIGN
// --------------------------------------------------------------
const PlanCard = ({ title, subtitle, price, responses, buttonText, gradient, iconColor, badge, isSelected, onSelect, buttonGradient }) => {
    return (
        <TouchableOpacity 
            style={[
                styles.cardOuterWrapper,
                isSelected && styles.selectedCard
            ]} 
            onPress={onSelect}
            activeOpacity={0.9}
        >
            <LinearGradient
                colors={gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardContainer}
            >
                {badge && (
                    <View style={styles.badgeBox}>
                        <Text style={styles.badgeText}>🔥 Popular</Text>
                    </View>
                )}

                {/* Top Row: Icon and Title */}
                <View style={styles.topRow}>
                    <View style={[styles.iconCircle, { backgroundColor: iconColor + '20' }]}>
                        <MaterialCommunityIcons name="chart-bar" size={26} color={iconColor} />
                    </View>
                    
                    <View style={styles.titleSection}>
                        <Text style={styles.cardTitle}>{title}</Text>
                        <Text style={styles.cardSubtitle} numberOfLines={2}>{subtitle}</Text>
                    </View>
                    
                    {isSelected && (
                        <View style={styles.selectedIndicator}>
                            <MaterialIcons name="check-circle" size={20} color="#FF7E1D" />
                        </View>
                    )}
                </View>

                {/* Middle: Price and Responses */}
                <View style={styles.priceRow}>
                    <Text style={styles.priceText}>Rs {price}</Text>
                    <Text style={styles.responsesText}>for {responses} responses</Text>
                </View>

                {/* Button at Bottom */}
                <LinearGradient
                    colors={buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                >
                    <TouchableOpacity 
                        style={styles.selectBtn}
                        onPress={onSelect}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.selectBtnText}>
                            {isSelected ? 'Selected' : buttonText}
                        </Text>
                    </TouchableOpacity>
                </LinearGradient>
            </LinearGradient>
        </TouchableOpacity>
    );
};

// --------------------------------------------------------------
// 🔹 CUSTOM PLAN CARD — SQUARE
// --------------------------------------------------------------
const CustomPlan = ({ isSelected, onSelect, customResponses, setCustomResponses }) => {
    const cost = customResponses ? parseInt(customResponses) * 2 : 0;

    return (
        <TouchableOpacity 
            style={[
                styles.cardOuterWrapper,
                isSelected && styles.selectedCard
            ]} 
            onPress={onSelect}
            activeOpacity={0.9}
        >
            <LinearGradient
                colors={["#ECE7FF", "#FFFFFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardContainerCustom}
            >
                {/* Top Row: Icon and Title */}
                <View style={styles.topRow}>
                    <View style={styles.iconCirclePurple}>
                        <MaterialCommunityIcons name="cog" size={26} color="#fff" />
                    </View>
                    
                    <View style={styles.titleSection}>
                        <Text style={styles.cardTitle}>Custom Plan</Text>
                        <Text style={styles.cardSubtitle}>Need a custom number of responses?</Text>
                    </View>
                    
                    {isSelected && (
                        <View style={styles.selectedIndicator}>
                            <MaterialIcons name="check-circle" size={20} color="#7C58FF" />
                        </View>
                    )}
                </View>

                {/* Input Section */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Enter number of responses</Text>
                    <TextInput
                        style={[
                            styles.inputBox,
                            isSelected && styles.inputBoxSelected
                        ]}
                        keyboardType="numeric"
                        placeholder="e.g. 500"
                        placeholderTextColor="#b6b6b6"
                        value={customResponses}
                        onChangeText={setCustomResponses}
                        onFocus={onSelect}
                    />
                    
                    <View style={styles.customPriceRow}>
                        <Text style={styles.priceLabel}>Estimated Cost:</Text>
                        <View style={styles.customPriceDisplay}>
                            <Text style={styles.customPriceText}>Rs {cost || '0'}</Text>
                        </View>
                    </View>
                </View>

                {/* Button at Bottom */}
                <LinearGradient
                    colors={["#7C58FF", "#9D7AFF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                >
                    <TouchableOpacity 
                        style={styles.selectBtn}
                        onPress={onSelect}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.selectBtnText}>
                            {isSelected ? 'Selected' : 'Select Custom'}
                        </Text>
                    </TouchableOpacity>
                </LinearGradient>
            </LinearGradient>
        </TouchableOpacity>
    );
};

// --------------------------------------------------------------
// 🔹 PAYMENT BAR COMPONENT 
// --------------------------------------------------------------
const PaymentBar = ({ selectedPlan, planPrice, onPublish, customResponses, isPublishing }) => {
    // Don't show if no plan is selected
    if (!selectedPlan) return null;

    const getPlanName = () => {
        switch(selectedPlan) {
            case 'basic': return 'Basic Plan';
            case 'standard': return 'Standard Plan';
            case 'premium': return 'Premium Plan';
            case 'custom': return `Custom Plan (${customResponses || 0} responses)`;
            default: return 'Selected Plan';
        }
    };

    return (
        <View style={styles.paymentBarContainerFixed}>
            <View style={styles.paymentBar}>
                <View style={styles.paymentHeader}>
                    <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                    <Text style={styles.paymentTitle}>Plan Selected ✓</Text>
                </View>
                
                <View style={styles.paymentDetails}>
                    <View style={styles.planInfo}>
                        <Text style={styles.planName}>{getPlanName()}</Text>
                        <Text style={styles.planResponses}>
                            {selectedPlan === 'custom' 
                                ? `${customResponses || 0} responses` 
                                : selectedPlan === 'basic' ? '100 responses' 
                                : selectedPlan === 'standard' ? '300 responses' 
                                : '1000 responses'}
                        </Text>
                    </View>
                    
                    <View style={styles.priceSection}>
                        <Text style={styles.totalLabel}>Total:</Text>
                        <Text style={styles.totalAmount}>Rs {planPrice}</Text>
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.publishBtn, isPublishing && styles.publishBtnDisabled]}
                    onPress={onPublish}
                    disabled={isPublishing}
                >
                    <LinearGradient
                        colors={["#FF7E1D", "#FFAD33"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.publishGradient}
                    >
                        {isPublishing ? (
                            <>
                                <MaterialIcons name="hourglass-empty" size={20} color="#fff" />
                                <Text style={styles.publishText}>Publishing...</Text>
                            </>
                        ) : (
                            <>
                                <MaterialIcons name="send" size={20} color="#fff" />
                                <Text style={styles.publishText}>Publish Survey</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.securityRow}>
                    <MaterialIcons name="security" size={16} color="#4CAF50" />
                    <Text style={styles.securityText}>
                        Secure payment • Cancel anytime • 24/7 support
                    </Text>
                </View>
            </View>
        </View>
    );
};

// --------------------------------------------------------------
// 🔹 MAIN SCREEN — WITH PERSISTENT PAYMENT BAR
// --------------------------------------------------------------
const ChoosePlanScreen = ({ navigation, route }) => {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [customResponses, setCustomResponses] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);
    
    // Get form data from navigation params (from PreviewScreen or CreateNewSurveyScreen)
    const formData = route.params?.formData || {};

    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan);
        if (plan !== 'custom') {
            setCustomResponses('');
        }
    };

    const getSelectedPlanPrice = () => {
        switch(selectedPlan) {
            case 'basic': return 300;
            case 'standard': return 750;
            case 'premium': return 2000;
            case 'custom': 
                const responses = parseInt(customResponses) || 0;
                return responses * 2;
            default: return 0;
        }
    };

    const handlePublish = async () => {
        if (!selectedPlan) {
            Alert.alert("Select Plan", "Please select a plan first to publish your survey.");
            return;
        }

        // Validate custom plan
        if (selectedPlan === 'custom') {
            const responses = parseInt(customResponses) || 0;
            if (!responses || responses < 10) {
                Alert.alert("Invalid Responses", "Custom plan must have at least 10 responses.");
                return;
            }
            if (responses > 10000) {
                Alert.alert("Limit Exceeded", "Maximum 10,000 responses allowed for custom plan.");
                return;
            }
        }

        setIsPublishing(true);

        try {
            // Create published survey object
            const publishedSurvey = {
                id: Date.now().toString(),
                title: formData.formHeading || "Untitled Survey",
                description: formData.formDescription || "No description",
                category: formData.selectedCategory || "General",
                plan: selectedPlan,
                planName: selectedPlan === 'basic' ? 'Basic' : 
                          selectedPlan === 'standard' ? 'Standard' : 
                          selectedPlan === 'premium' ? 'Premium' : 'Custom',
                price: getSelectedPlanPrice(),
                responses: selectedPlan === 'custom' ? (parseInt(customResponses) || 0) : 
                         selectedPlan === 'basic' ? 100 :
                         selectedPlan === 'standard' ? 300 : 1000,
                questions: formData.questions || [],
                demographicFilters: formData.demographicFilters || {},
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: 'published',
                responsesCollected: 0,
                totalResponses: selectedPlan === 'custom' ? (parseInt(customResponses) || 0) : 
                               selectedPlan === 'basic' ? 100 :
                               selectedPlan === 'standard' ? 300 : 1000
            };

            // Get existing published surveys
            const existingPublished = await AsyncStorage.getItem('publishedSurveys');
            const publishedSurveys = existingPublished ? JSON.parse(existingPublished) : [];
            
            // Add new published survey at the beginning
            publishedSurveys.unshift(publishedSurvey);
            
            // Save back to AsyncStorage
            await AsyncStorage.setItem('publishedSurveys', JSON.stringify(publishedSurveys));
            
            // Also remove from drafts if it was saved as draft
            try {
                const existingDrafts = await AsyncStorage.getItem('surveyDrafts');
                if (existingDrafts) {
                    const drafts = JSON.parse(existingDrafts);
                    // Remove draft with same title (optional logic)
                    const updatedDrafts = drafts.filter(draft => 
                        draft.formHeading !== formData.formHeading
                    );
                    await AsyncStorage.setItem('surveyDrafts', JSON.stringify(updatedDrafts));
                }
            } catch (draftError) {
                // Ignore draft removal errors
                console.log('Draft removal optional:', draftError);
            }
            
            setIsPublishing(false);
            
            // Show success message with better navigation options
            Alert.alert(
                "Success! 🎉",
                `Your survey "${publishedSurvey.title}" has been published successfully!\n\nPlan: ${publishedSurvey.planName}\nResponses: ${publishedSurvey.responses}\nPrice: Rs ${publishedSurvey.price}`,
                [
                    { 
                        text: "View Published Surveys", 
                        onPress: () => {
                            // Navigate directly to PublishedSurveysScreen
                            navigation.reset({
                                index: 1,
                                routes: [
                                    { name: 'CreatorDashboard' },
                                    { name: 'PublishedSurveysScreen' }
                                ],
                            });
                        }
                    },
                    {
                        text: "Go to Dashboard",
                        onPress: () => {
                            navigation.navigate('CreatorDashboard', { refresh: true });
                        }
                    },
                    {
                        text: "Create Another",
                        style: 'destructive',
                        onPress: () => {
                            navigation.navigate('CreateNewSurvey');
                        }
                    }
                ]
            );
            
        } catch (error) {
            setIsPublishing(false);
            console.error('Error publishing survey:', error);
            Alert.alert("Publishing Failed", "Failed to publish survey. Please try again.");
        }
    };

    // Calculate dynamic bottom padding for ScrollView so content doesn't get hidden by the PaymentBar
    const bottomPadding = selectedPlan ? 160 : 0; // Approx height of payment bar + safe area padding

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Enhanced Header */}
            <LinearGradient
                colors={["#FF7E1D", "#FFAD33"]}
                style={styles.headerGradient}
            >
                <View style={styles.header}>
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <MaterialIcons name="arrow-back-ios" size={22} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <View style={styles.headerIconBox}>
                            <MaterialCommunityIcons name="chart-bar" size={24} color="#FF7E1D" />
                        </View>
                        <Text style={styles.headerTitle}>Choose Your Plan</Text>
                    </View>

                    <View style={styles.placeholder} />
                </View>
            </LinearGradient>

            <ScrollView 
                contentContainerStyle={[
                    styles.scrollArea, 
                    { paddingBottom: styles.scrollArea.paddingBottom + bottomPadding }
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Survey Info Card */}
                {formData.formHeading && (
                    <View style={styles.fullWidthItem}>
                        <View style={styles.surveyInfoCard}>
                            <View style={styles.surveyInfoHeader}>
                                <MaterialCommunityIcons name="clipboard-text" size={20} color="#FF7E1D" />
                                <Text style={styles.surveyInfoTitle}>Survey Ready to Publish</Text>
                            </View>
                            <Text style={styles.surveyTitle}>{formData.formHeading}</Text>
                            <Text style={styles.surveyDescription} numberOfLines={2}>
                                {formData.formDescription || "No description provided"}
                            </Text>
                            <View style={styles.surveyMeta}>
                                <View style={styles.metaItem}>
                                    <MaterialCommunityIcons name="format-list-bulleted" size={16} color="#666" />
                                    <Text style={styles.metaText}>
                                        {formData.questions?.length || 0} questions
                                    </Text>
                                </View>
                                {formData.selectedCategory && (
                                    <View style={styles.metaItem}>
                                        <MaterialCommunityIcons name="tag" size={16} color="#666" />
                                        <Text style={styles.metaText}>{formData.selectedCategory}</Text>
                                    </View>
                                )}
                                {formData.demographicFilters && (
                                    <View style={styles.metaItem}>
                                        <MaterialCommunityIcons name="account-group" size={16} color="#666" />
                                        <Text style={styles.metaText}>
                                            {formData.demographicFilters.gender || formData.demographicFilters.age ? 
                                             "Targeted" : "Public"}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                )}

                {/* Instruction Card */}
                <View style={styles.fullWidthItem}>
                    <View style={styles.headerCard}>
                        <Text style={styles.headerCardTitle}>Select a Pricing Plan</Text>
                        <Text style={styles.headerCardSubtitle}>
                            Choose the plan that best fits your survey needs. All plans include unlimited questions, real-time analytics, and 24/7 support.
                        </Text>
                    </View>
                </View>

                {/* Basic Plan */}
                <PlanCard
                    title="Basic Plan"
                    subtitle="Perfect for small surveys and quick feedback"
                    price="300"
                    responses="100"
                    buttonText="Select Basic"
                    gradient={["#F0FDF4", "#E6FDED", "#BBF7D0", "#86EFAC"]}
                    buttonGradient={["#4ADE80", "#13AE66", "#16A34A"]}
                    iconColor="#0F8D45"
                    isSelected={selectedPlan === 'basic'}
                    onSelect={() => handlePlanSelect('basic')}
                />

                {/* Standard Plan */}
                <PlanCard
                    title="Standard Plan"
                    subtitle="Great for growing businesses and medium surveys"
                    price="750"
                    responses="300"
                    buttonText="Select Standard"
                    gradient={["#FFF7ED", "#FFEDD5", "#FED7AA", "#FBBF24"]}
                    buttonGradient={["#FB923C", "#FACC15", "#F97316"]}
                    iconColor="#FF9800"
                    badge
                    isSelected={selectedPlan === 'standard'}
                    onSelect={() => handlePlanSelect('standard')}
                />

                {/* Premium Plan */}
                <PlanCard
                    title="Premium Plan"
                    subtitle="For large-scale surveys and enterprise needs"
                    price="2000"
                    responses="1000"
                    buttonText="Select Premium"
                    gradient={["#FEF2F2", "#FEE2E2", "#FCA5A5", "#F87171"]}
                    buttonGradient={["#F87171", "#EC4899", "#DC2626"]}
                    iconColor="#E91E63"
                    isSelected={selectedPlan === 'premium'}
                    onSelect={() => handlePlanSelect('premium')}
                />

                {/* Custom */}
                <CustomPlan
                    isSelected={selectedPlan === 'custom'}
                    onSelect={() => handlePlanSelect('custom')}
                    customResponses={customResponses}
                    setCustomResponses={setCustomResponses}
                />

                {/* Features Comparison */}
                <View style={styles.fullWidthItem}>
                    <View style={styles.featuresCard}>
                        <Text style={styles.featuresTitle}>All Plans Include:</Text>
                        <View style={styles.featuresList}>
                            <View style={styles.featureItem}>
                                <MaterialIcons name="check-circle" size={18} color="#4CAF50" />
                                <Text style={styles.featureText}>Unlimited Questions</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <MaterialIcons name="check-circle" size={18} color="#4CAF50" />
                                <Text style={styles.featureText}>Real-time Analytics</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <MaterialIcons name="check-circle" size={18} color="#4CAF50" />
                                <Text style={styles.featureText}>Data Export (CSV/Excel)</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <MaterialIcons name="check-circle" size={18} color="#4CAF50" />
                                <Text style={styles.featureText}>24/7 Customer Support</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <MaterialIcons name="check-circle" size={18} color="#4CAF50" />
                                <Text style={styles.featureText}>Mobile Responsive</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <MaterialIcons name="check-circle" size={18} color="#4CAF50" />
                                <Text style={styles.featureText}>Secure Data Storage</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* FAQ Section */}
                <View style={styles.fullWidthItem}>
                    <View style={styles.faqCard}>
                        <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
                        <View style={styles.faqItem}>
                            <Text style={styles.faqQuestion}>Can I upgrade my plan later?</Text>
                            <Text style={styles.faqAnswer}>Yes, you can upgrade at any time. The difference will be prorated.</Text>
                        </View>
                        <View style={styles.faqItem}>
                            <Text style={styles.faqQuestion}>What happens if I exceed my response limit?</Text>
                            <Text style={styles.faqAnswer}>You'll be notified and can upgrade to a higher plan or purchase additional responses.</Text>
                        </View>
                        <View style={styles.faqItem}>
                            <Text style={styles.faqQuestion}>Is there a refund policy?</Text>
                            <Text style={styles.faqAnswer}>Yes, we offer a 14-day money-back guarantee for all plans.</Text>
                        </View>
                        <View style={styles.faqItem}>
                            <Text style={styles.faqQuestion}>How are responses counted?</Text>
                            <Text style={styles.faqAnswer}>Each completed survey submission counts as one response.</Text>
                        </View>
                    </View>
                </View>

                {/* Notes Section */}
                <View style={styles.fullWidthItem}>
                    <View style={styles.notesCard}>
                        <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#FF7E1D" />
                        <Text style={styles.notesText}>
                            <Text style={styles.notesBold}>Note:</Text> After publishing, your survey will be live immediately. You can track responses and analytics from the Published Surveys section.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Payment Bar - FIXED at the bottom */}
            <PaymentBar 
                selectedPlan={selectedPlan}
                planPrice={getSelectedPlanPrice()}
                onPublish={handlePublish}
                customResponses={customResponses}
                isPublishing={isPublishing}
            />

            {/* Instruction overlay when no plan selected */}
            {!selectedPlan && (
                <View style={styles.instructionOverlay}>
                    <View style={styles.instructionCard}>
                        <MaterialCommunityIcons name="cursor-default-click" size={40} color="#FF7E1D" />
                        <Text style={styles.instructionTitle}>Select a Plan to Continue</Text>
                        <Text style={styles.instructionText}>
                            Choose one of the plans above to proceed with publishing your survey
                        </Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

// --------------------------------------------------------------
// 🔹 STYLE UPDATES
// --------------------------------------------------------------
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    headerGradient: {
        paddingTop: 50,
        paddingBottom: 20,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },
    backButton: {
        padding: 8,
    },
    headerCenter: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerIconBox: {
        width: 40,
        height: 40,
        backgroundColor: "#fff",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#fff",
    },
    placeholder: {
        width: 40,
    },
    scrollArea: {
        padding: 16,
        paddingBottom: 30,
        alignItems: 'center', 
    },
    fullWidthItem: {
        width: '100%',
        paddingHorizontal: 0,
    },
    // Survey Info Card
    surveyInfoCard: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: "#FF7E1D",
    },
    surveyInfoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    surveyInfoTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FF7E1D",
        marginLeft: 8,
    },
    surveyTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#222",
        marginBottom: 6,
    },
    surveyDescription: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
        marginBottom: 12,
    },
    surveyMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#F8F9FA",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    metaText: {
        fontSize: 12,
        color: "#666",
        marginLeft: 6,
    },
    headerCard: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    headerCardTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333",
        marginBottom: 6,
    },
    headerCardSubtitle: {
        fontSize: 13,
        color: "#666",
        lineHeight: 18,
    },
    cardOuterWrapper: {
        marginBottom: 16,
        borderRadius: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        width: 310, 
    },
    selectedCard: {
        transform: [{ scale: 1.02 }],
        elevation: 6,
        shadowColor: "#FF7E1D",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    cardContainer: {
        borderRadius: 20,
        padding: 20,
        paddingBottom: 20,
    },
    cardContainerCustom: {
        borderRadius: 20,
        padding: 20,
        paddingBottom: 20,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 8, 
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    iconCirclePurple: {
        width: 50,
        height: 50,
        borderRadius: 14,
        backgroundColor: "#7C58FF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    titleSection: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#222",
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 13,
        color: "#666",
        lineHeight: 16,
    },
    selectedIndicator: {
        marginLeft: 8,
    },
    badgeBox: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: "#FF7E1D",
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
        zIndex: 1,
    },
    badgeText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 11,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12, 
        marginTop: 8, 
    },
    priceText: {
        fontSize: 28,
        fontWeight: "800",
        color: "#222",
        marginRight: 10,
        marginTop: 0,
    },
    responsesText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    inputSection: {
        marginBottom: 16,
        marginTop: 8,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#444",
        marginBottom: 6,
    },
    inputBox: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#e5e5e5",
        borderRadius: 10,
        padding: 10,
        fontSize: 14,
        color: "#222",
        marginBottom: 12,
    },
    inputBoxSelected: {
        borderColor: "#7C58FF",
        backgroundColor: "#F8F7FF",
    },
    customPriceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    priceLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#444",
    },
    customPriceDisplay: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    customPriceText: {
        fontSize: 24,
        fontWeight: "800",
        color: "#7C58FF",
    },
    buttonGradient: {
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    selectBtn: {
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    selectBtnText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 15,
        textAlign: "center",
    },
    featuresCard: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 16,
        marginTop: 8,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    featuresTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#333",
        marginBottom: 10,
    },
    featuresList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        marginBottom: 6,
    },
    featureText: {
        fontSize: 12,
        color: "#666",
        marginLeft: 6,
    },
    // FAQ Styles
    faqCard: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 16,
        marginTop: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    faqTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#333",
        marginBottom: 12,
    },
    faqItem: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    faqQuestion: {
        fontSize: 14,
        fontWeight: "600",
        color: "#444",
        marginBottom: 4,
    },
    faqAnswer: {
        fontSize: 13,
        color: "#666",
        lineHeight: 18,
    },
    // Notes Card
    notesCard: {
        backgroundColor: "#FFF9E6",
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
        borderWidth: 1,
        borderColor: "#FFE8B3",
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    notesText: {
        fontSize: 13,
        color: "#664D00",
        lineHeight: 18,
        marginLeft: 10,
        flex: 1,
    },
    notesBold: {
        fontWeight: '700',
    },
    // --- PAYMENT BAR STYLES ---
    paymentBarContainerFixed: { 
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingBottom: 16, 
        backgroundColor: 'transparent', 
        zIndex: 10, 
    },
    paymentBar: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 16,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    paymentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderColor: "#f0f0f0",
    },
    paymentTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#4CAF50",
        marginLeft: 8,
    },
    paymentDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    planInfo: {
        flex: 1,
    },
    planName: {
        fontSize: 15,
        fontWeight: "700",
        color: "#333",
        marginBottom: 4,
    },
    planResponses: {
        fontSize: 13,
        color: "#666",
    },
    priceSection: {
        alignItems: 'flex-end',
    },
    totalLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#666",
        marginBottom: 2,
    },
    totalAmount: {
        fontSize: 22,
        fontWeight: "800",
        color: "#FF7E1D",
    },
    publishBtn: {
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: "#FF7E1D",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        marginBottom: 12,
    },
    publishBtnDisabled: {
        opacity: 0.7,
    },
    publishGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 18,
    },
    publishText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "800",
        marginLeft: 8,
    },
    securityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    securityText: {
        fontSize: 11,
        color: "#888",
        marginLeft: 6,
    },
    // Instruction Overlay 
    instructionOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    instructionCard: {
        alignItems: 'center',
        padding: 16,
    },
    instructionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FF7E1D",
        marginTop: 12,
        marginBottom: 6,
    },
    instructionText: {
        fontSize: 13,
        color: "#666",
        textAlign: 'center',
        lineHeight: 18,
    },
});

export default ChoosePlanScreen;