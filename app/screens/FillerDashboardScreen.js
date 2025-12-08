import React, { useEffect, useState, useCallback } from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    Alert, 
    Modal, 
    Dimensions,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../supabaseClient';

const { width } = Dimensions.get('window');

// ✅ CORRECT API ENDPOINTS
const SUPABASE_URL = 'https://oyavjqycsjfcnzlshdsu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95YXZqcXljc2pmY256bHNoZHN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNTgwMjcsImV4cCI6MjA3NTczNDAyN30.22cwyIWSBmhLefCvobdbH42cPSTnw_NmSwbwaYvyLy4';

const USER_PROFILES_URL = `${SUPABASE_URL}/rest/v1/user_profiles`;
const SURVEY_RESPONSES_URL = `${SUPABASE_URL}/rest/v1/survey_responses`;
const SURVEYS_URL = `${SUPABASE_URL}/rest/v1/surveys`;

// ----------------------------------------------------
// ✅ SURVEY UNLOCK MODAL
// ----------------------------------------------------
const SurveyUnlockModal = ({ visible, onClose }) => {
    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={modalStyles.modalOverlay}>
                <View style={modalStyles.surveyModalContent}>
                    <View style={modalStyles.surveyIconCircle}>
                        <MaterialIcons name="description" size={35} color="#fff" />
                    </View>
                    <Text style={modalStyles.surveyModalMessage}>
                        Your completed profile has unlocked new{" "}
                        <Text style={modalStyles.surveyModalHighlightBold}>paid surveys</Text>.
                        {"\n"}
                        Complete them to{" "}
                        <Text style={modalStyles.surveyModalHighlight}>start earning more</Text>.
                    </Text>
                    <TouchableOpacity onPress={onClose} style={modalStyles.surveyModalButtonContainer}>
                        <LinearGradient colors={['#FF7E1D', '#FFD464']} style={modalStyles.surveyModalButtonGradient}>
                            <Text style={modalStyles.surveyModalButtonText}>Got it!</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

// ----------------------------------------------------
// ✅ GREEN PROFILE COMPLETION CARD (2 MINUTES ONLY - SIMPLE UI)
// ----------------------------------------------------
const GreenProfileCompletionCard = ({ 
    isProfileComplete, 
    showGreenCard,
    navigation 
}) => {
    // ✅ Agar profile complete nahi hai ya green card show nahi karna, toh return null
    if (!isProfileComplete || !showGreenCard) {
        return null;
    }

    return (
        <TouchableOpacity 
            style={[styles.card, styles.greenProfileCard]}
            onPress={() => navigation.navigate('ProfileViewScreen')}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                {/* ✅ GREEN GRADIENT ICON (LOCK) */}
                <LinearGradient
                    colors={['#38C172', '#69e09d']}
                    style={styles.iconGradientContainer}
                >
                    <MaterialIcons name="lock" size={28} color="#fff" />
                </LinearGradient>
                
                <View style={styles.cardContent}>
                    <Text style={styles.greenCardTitle}>Profile Complete</Text>
                    <Text style={styles.greenCardDescription}>
                        Your profile is now locked and verified
                    </Text>
                </View>
                
                {/* ✅ GREEN CHECKMARK */}
                <MaterialIcons name="check-circle" size={24} color="#38C172" />
            </View>
        </TouchableOpacity>
    );
};

// ----------------------------------------------------
// ✅ REGULAR PROFILE CARD (INCOMPLETE - SIMPLE UI)
// ----------------------------------------------------
const RegularProfileCard = ({ isProfileComplete, navigation }) => {
    if (isProfileComplete) {
        return null; // ✅ Complete profile ke liye RegularProfileCard nahi dikhega
    }

    return (
        <TouchableOpacity 
            style={[styles.card, styles.incompleteProfileCard]}
            onPress={() => navigation.navigate('ProfileCompletionScreen')}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <LinearGradient
                    colors={['#FF7E1D', '#FFD464']}
                    style={styles.iconGradientContainer}
                >
                    <MaterialIcons name="person" size={28} color="#fff" />
                </LinearGradient>
                
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Complete Your Profile</Text>
                    <Text style={styles.cardDescription}>
                        Complete your profile to unlock surveys and start earning.
                    </Text>
                </View>
                
                <LinearGradient colors={['#FF7E1D', '#FFD464']} style={styles.solidCardButton}>
                    <Text style={styles.cardButtonText}>+ Rs. 50</Text>
                </LinearGradient>
            </View>
        </TouchableOpacity>
    );
};

// ----------------------------------------------------
// ✅ SURVEY CARD COMPONENT - EXACTLY LIKE PROFILE FORM CARD
// ----------------------------------------------------
const SurveyCard = ({ survey, onPress, completed }) => {
    // ✅ Determine colors and icon based on status
    const cardGradientColors = completed ? ['#38C172', '#69e09d'] : ['#FF7E1D', '#FFD464'];
    const cardIcon = completed ? 'lock' : 'description';
    const cardBorderColor = completed ? '#38C172' : '#FF7E1D';
    const cardBackgroundColor = completed ? '#38C17224' : '#F6B93B24';
    
    // ✅ Use survey's actual description
    let surveyDescription = survey.description || 'Complete this survey and earn rewards';
    if (completed) {
        surveyDescription = 'You have completed this survey. Thank you!';
    }
    
    return (
        <TouchableOpacity 
            style={[
                styles.card, 
                { 
                    backgroundColor: cardBackgroundColor, 
                    borderColor: cardBorderColor 
                }
            ]}
            onPress={onPress}
            disabled={completed}
            activeOpacity={completed ? 1 : 0.8}
        >
            <View style={styles.cardHeader}>
                {/* ✅ GRADIENT ICON (SAME AS PROFILE CARD) */}
                <LinearGradient
                    colors={cardGradientColors}
                    style={styles.iconGradientContainer}
                >
                    <MaterialIcons 
                        name={cardIcon} 
                        size={28} 
                        color="#fff" 
                    />
                </LinearGradient>
                
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{survey.title}</Text>
                    <Text style={styles.surveyCategory}>{survey.category || 'General Survey'}</Text>
                </View>
            </View>
            
            {/* ✅ DESCRIPTION (SURVEY'S ACTUAL DESCRIPTION) */}
            <View>
                <Text style={styles.cardDescription} numberOfLines={3}>
                    {surveyDescription}
                </Text>
            </View>
            
            {/* ✅ FOOTER WITH PRICE AND BUTTON (SAME AS PROFILE CARD) */}
            <View style={styles.cardFooter}>
                <View style={styles.priceContainer}>
                    <MaterialIcons name="account-balance-wallet" size={18} color={completed ? '#38C172' : '#FF7E1D'} />
                    <Text style={[styles.priceText, { color: completed ? '#38C172' : '#FF7E1D' }]}>
                        Rs {survey.price || '0'}
                    </Text>
                </View>
                
                {completed ? (
                    <View style={[styles.solidCardButton, {backgroundColor: '#38C172'}]}>
                        <Text style={styles.cardButtonText}>Completed</Text>
                    </View>
                ) : (
                    <LinearGradient colors={['#FF7E1D', '#FFD464']} style={styles.solidCardButton}>
                        <Text style={styles.cardButtonText}>Start</Text>
                    </LinearGradient>
                )}
            </View>
        </TouchableOpacity>
    );
};

// ----------------------------------------------------
// ✅ MAIN COMPONENT
// ----------------------------------------------------
const FillerDashboardScreen = ({ navigation, route }) => {
    // --- State Variables ---
    const [walletBalance, setWalletBalance] = useState(0);
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    const [isSurveyUnlockModalVisible, setIsSurveyUnlockModalVisible] = useState(false);
    const [availableSurveys, setAvailableSurveys] = useState([]);
    const [completedSurveyIds, setCompletedSurveyIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userName, setUserName] = useState('');
    
    // ✅ NEW: Green card visibility state
    const [showGreenProfileCard, setShowGreenProfileCard] = useState(false);
    const [hasShownGreenCard, setHasShownGreenCard] = useState(false);
    const [greenCardTimer, setGreenCardTimer] = useState(null);

    // --- Check if green card already shown from AsyncStorage ---
    useEffect(() => {
        checkGreenCardStatus();
        return () => {
            if (greenCardTimer) {
                clearTimeout(greenCardTimer);
            }
        };
    }, []);

    const checkGreenCardStatus = async () => {
        try {
            const shown = await AsyncStorage.getItem('@has_shown_green_card');
            if (shown === 'true') {
                setHasShownGreenCard(true);
            }
        } catch (error) {
            console.error('Error checking green card status:', error);
        }
    };

    const markGreenCardAsShown = async () => {
        try {
            await AsyncStorage.setItem('@has_shown_green_card', 'true');
            setHasShownGreenCard(true);
        } catch (error) {
            console.error('Error saving green card status:', error);
        }
    };

    // ✅ Function to show green card temporarily
    const showTemporaryGreenCard = () => {
        // ✅ Agar pehle kabhi dikha chuke hain, toh dobara nahi dikhayenge
        if (hasShownGreenCard) {
            return;
        }

        setShowGreenProfileCard(true);
        markGreenCardAsShown(); // ✅ Permanent mark - kabhi dobara nahi dikhega
        
        // ✅ Hide green card after exactly 2 minutes (120000 milliseconds)
        const timer = setTimeout(() => {
            setShowGreenProfileCard(false);
        }, 120000);
        
        setGreenCardTimer(timer);
    };

    // --- Fetch Data Functions ---
    const checkProfileCompletion = useCallback(async () => {
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError || !session) {
                return false;
            }

            const response = await fetch(
                `${USER_PROFILES_URL}?user_id=eq.${session.user.id}&select=*`,
                {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                return false;
            }

            const data = await response.json();
            
            if (data && data.length > 0) {
                const profile = data[0];
                
                // ✅ Set user name if available
                if (profile.full_name && profile.full_name.trim() !== '') {
                    const firstName = profile.full_name.split(' ')[0];
                    setUserName(firstName);
                } else {
                    setUserName('');
                }
                
                // Check if all required fields are filled
                const requiredFields = ['full_name', 'gender', 'date_of_birth', 'marital_status', 
                                      'mobile_number', 'cnic_number', 'education', 'profession'];
                
                const filledFields = requiredFields.filter(field => 
                    profile[field] && profile[field].toString().trim() !== ''
                );
                
                const isComplete = filledFields.length === requiredFields.length;
                return isComplete;
            } else {
                return false;
            }
        } catch (error) {
            console.error('❌ Error checking profile:', error);
            return false;
        }
    }, []);

    const fetchCompletedSurveys = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return new Set();

            const response = await fetch(
                `${SURVEY_RESPONSES_URL}?user_id=eq.${session.user.id}&select=survey_id`,
                {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                const completedIds = new Set(data.map(item => item.survey_id));
                return completedIds;
            } else {
                return new Set();
            }
        } catch (error) {
            console.error('❌ Error fetching completed surveys:', error);
            return new Set();
        }
    }, []);

    const fetchAvailableSurveys = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Get user's demographic info
            const profileResponse = await fetch(
                `${USER_PROFILES_URL}?user_id=eq.${session.user.id}&select=gender,date_of_birth`,
                {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            let userGender = null;
            if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                if (profileData.length > 0) {
                    userGender = profileData[0].gender;
                }
            }

            // Fetch all published surveys
            const surveysResponse = await fetch(
                `${SURVEYS_URL}?is_draft=eq.false&is_public_form=eq.true&status=eq.published&select=*`,
                {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (surveysResponse.ok) {
                let surveys = await surveysResponse.json();
                
                // Apply demographic filtering
                if (userGender) {
                    surveys = surveys.filter(survey => {
                        if (!survey.demographic_filters) return true;
                        try {
                            const filters = JSON.parse(survey.demographic_filters);
                            return !filters.gender || filters.gender === userGender;
                        } catch {
                            return true;
                        }
                    });
                }
                
                setAvailableSurveys(surveys);
            }
        } catch (error) {
            console.error('❌ Error fetching surveys:', error);
        }
    }, []);

    // --- Refresh Handler ---
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
    }, []);

    const loadDashboardData = useCallback(async () => {
        setLoading(true);
        
        try {
            const [profileComplete, completedSurveys] = await Promise.all([
                checkProfileCompletion(),
                fetchCompletedSurveys()
            ]);
            
            setIsProfileComplete(profileComplete);
            setCompletedSurveyIds(completedSurveys);
            
            if (profileComplete) {
                await fetchAvailableSurveys();
            }
        } catch (error) {
            console.error('❌ Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    }, [checkProfileCompletion, fetchCompletedSurveys, fetchAvailableSurveys]);

    // --- Effects ---
    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    useEffect(() => {
        const { 
            awardedAmount, 
            isProfileComplete: profileCompleteStatus, 
            showSurveyUnlockPopup,
            showGreenProfileCard: showGreenCard
        } = route.params || {};

        let needsParamClear = false;

        if (profileCompleteStatus !== undefined) {
            setIsProfileComplete(profileCompleteStatus);
        }

        // ✅ 50 Rs wallet main add karo
        if (awardedAmount > 0) {
            setWalletBalance(prev => {
                const newBalance = prev + awardedAmount;
                console.log(`✅ Wallet updated: ${prev} + ${awardedAmount} = ${newBalance}`);
                return newBalance;
            });
            needsParamClear = true;
        }

        if (showSurveyUnlockPopup) {
            setIsSurveyUnlockModalVisible(true);
            needsParamClear = true;
        }

        // ✅ Green Card Logic - Sirf tabhi dikhao jab showGreenCard true ho
        // Aur pehle kabhi nahi dikhaya ho
        if (showGreenCard && !hasShownGreenCard) {
            showTemporaryGreenCard();
            needsParamClear = true;
        }
        
        if (needsParamClear) {
            navigation.setParams({ 
                awardedAmount: undefined,
                showSurveyUnlockPopup: false,
                showGreenProfileCard: undefined
            });
        }
    }, [route.params, navigation, hasShownGreenCard]);

    // --- Render Content Function ---
    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF7E1D" />
                    <Text style={styles.loadingText}>Loading dashboard...</Text>
                </View>
            );
        }

        return (
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh} 
                        colors={['#FF7E1D']}
                        tintColor="#FF7E1D"
                    />
                }
            >
                {/* ✅ 1. GREEN Profile Card (Sirf 2 minutes ke liye) */}
                <GreenProfileCompletionCard
                    isProfileComplete={isProfileComplete}
                    showGreenCard={showGreenProfileCard}
                    navigation={navigation}
                />

                {/* ✅ 2. REGULAR Profile Card (Incomplete profile ke liye) */}
                <RegularProfileCard 
                    isProfileComplete={isProfileComplete}
                    navigation={navigation}
                />

                {/* 3. Available Surveys Section */}
                {isProfileComplete ? (
                    <>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="clipboard-list-outline" size={24} color="#FF7E1D" />
                            <Text style={styles.sectionTitle}>Available Surveys</Text>
                        </View>

                        {availableSurveys.length > 0 ? (
                            availableSurveys.map(survey => (
                                <SurveyCard
                                    key={survey.id}
                                    survey={survey}
                                    completed={completedSurveyIds.has(survey.id)}
                                    onPress={() => {
                                        if (completedSurveyIds.has(survey.id)) {
                                            Alert.alert('Already Completed', 'You have already completed this survey.');
                                            return;
                                        }
                                        navigation.navigate('SurveyDetailScreen', { surveyId: survey.id });
                                    }}
                                />
                            ))
                        ) : (
                            <View style={styles.emptyStateContainer}>
                                <MaterialIcons name="search-off" size={50} color="#ddd" />
                                <Text style={styles.emptyStateText}>More exciting surveys coming soon!</Text>
                                <Text style={styles.emptyStateSubtext}>Check back later for new surveys</Text>
                            </View>
                        )}
                    </>
                ) : (
                    /* ✅ UPDATED: Light color message for locked surveys */
                    <View style={styles.surveysLockedContainer}>
                        <MaterialIcons name="lock" size={40} color="#FF7E1D" style={styles.lockIcon} />
                        <Text style={styles.surveysLockedTitle}>Surveys Locked</Text>
                        <Text style={styles.surveysLockedText}>
                            More exciting surveys coming soon!
                        </Text>
                    </View>
                )}
            </ScrollView>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header - SIMPLE UI */}
            <LinearGradient
                colors={['#FF7E1D', '#FFD464']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <Text style={styles.welcomeText}>
                        {userName ? `Welcome, ${userName}` : 'Welcome'}
                    </Text>
                    
                    <TouchableOpacity 
                        style={styles.walletButton}
                        onPress={() => navigation.navigate('WalletScreen')}
                    >
                        <MaterialIcons 
                            name="account-balance-wallet" 
                            size={20} 
                            color="#FF7E1D" 
                        />
                        <Text style={styles.walletText}>Rs {walletBalance}</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Main Content */}
            {renderContent()}

            {/* Bottom Navigation - SIMPLE UI */}
            <LinearGradient
                colors={['#FF7E1D', '#FFD464']}
                style={styles.bottomNav}
            >
                <TabItem 
                    iconName="clipboard-list-outline" 
                    label="Surveys" 
                    isCurrent={true} 
                    onPress={() => {}} 
                />
                <TabItem 
                    iconName="wallet-outline" 
                    label="Wallet" 
                    isCurrent={false}
                    onPress={() => navigation.navigate('WalletScreen')}
                />
                <TabItem 
                    iconName="account-circle-outline" 
                    label="Profile" 
                    isCurrent={false}
                    onPress={() => navigation.navigate('ProfileViewScreen')}
                />
            </LinearGradient>

            {/* Modals */}
            <SurveyUnlockModal
                visible={isSurveyUnlockModalVisible}
                onClose={() => setIsSurveyUnlockModalVisible(false)}
            />
        </View>
    );
};

// TabItem Component - SIMPLE UI
const TabItem = ({ iconName, label, isCurrent, onPress }) => (
    <TouchableOpacity style={styles.tabItem} onPress={onPress}>
        <MaterialCommunityIcons 
            name={iconName} 
            size={26}
            color={isCurrent ? '#fff' : 'rgba(255, 255, 255, 0.6)'} 
        />
        <Text style={[styles.tabLabel, { color: isCurrent ? '#fff' : 'rgba(255, 255, 255, 0.6)' }]}>
            {label}
        </Text>
    </TouchableOpacity>
);

// ----------------------------------------------------
// 🎨 STYLES (EXACTLY LIKE PROFILE FORM CARD)
// ----------------------------------------------------
const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#fff',
    },
    
    // --- Header Styles ---
    header: {
        paddingTop: 60,
        paddingHorizontal: 15, 
        paddingBottom: 50, 
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
        maxWidth: '60%',
    },
    walletButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 15,
    },
    walletText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF7E1D',
        marginLeft: 5,
    },
    loadingContainer: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20,
    },
    loadingText: {
        marginTop: 10, 
        fontSize: 16, 
        color: '#666', 
        marginBottom: 20,
    },
    scrollContent: {
        paddingTop: 20,
        paddingHorizontal: 15, 
        paddingBottom: 100,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },

    // --- CARD STYLES (ALL CARDS USE SAME STYLES) ---
    card: {
        borderWidth: 1.5, 
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        marginLeft: 5,
        marginRight: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    
    // GREEN PROFILE CARD
    greenProfileCard: {
        backgroundColor: '#38C17224',
        borderColor: '#38C172',
    },
    greenCardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    greenCardDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
        lineHeight: 20,
    },
    
    // INCOMPLETE PROFILE CARD
    incompleteProfileCard: {
        backgroundColor: '#F6B93B24',
        borderColor: '#FF7E1D',
    },
    cardContent: {
        flex: 1,
        marginRight: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    cardDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
        lineHeight: 20,
    },
    
    // Survey specific styles
    surveyCategory: {
        fontSize: 12,
        color: '#FF7E1D',
        marginTop: 2,
    },
    
    iconGradientContainer: {
        padding: 8,
        borderRadius: 10,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    
    // Card Footer (for survey cards)
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    
    solidCardButton: {
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 15,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    
    // ✅ UPDATED: Surveys Locked Container with light text
    surveysLockedContainer: {
        alignItems: 'center', 
        paddingVertical: 40, 
        paddingHorizontal: 20,
        backgroundColor: '#FFF9F0', 
        borderRadius: 15, 
        marginTop: 10,
        borderWidth: 1, 
        borderColor: '#FFE4CC',
    },
    lockIcon: { 
        marginBottom: 15 
    },
    surveysLockedTitle: {
        fontSize: 20, 
        fontWeight: 'bold', 
        color: '#333', 
        marginBottom: 10,
    },
    surveysLockedText: {
        fontSize: 16, 
        color: '#FF7E1D',
        textAlign: 'center', 
        lineHeight: 24,
        fontStyle: 'italic',
    },
    
    emptyStateContainer: { 
        alignItems: 'center', 
        paddingVertical: 40 
    },
    emptyStateText: {
        fontSize: 18, 
        fontWeight: '600', 
        color: '#FF7E1D',
        marginTop: 15,
    },
    emptyStateSubtext: {
        fontSize: 14, 
        color: '#999', 
        marginTop: 5,
    },
    
    // --- Bottom Navigation Styles ---
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 80,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    tabItem: {
        alignItems: 'center',
        padding: 10,
    },
    tabLabel: {
        fontSize: 12,
        marginTop: 4,
        fontWeight: '600',
    },
});

const modalStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1, 
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center', 
        alignItems: 'center',
    },
    surveyModalContent: {
        width: width * 0.85, 
        backgroundColor: '#fff',
        borderRadius: 15, 
        padding: 30, 
        alignItems: 'center',
    },
    surveyIconCircle: {
        width: 70, 
        height: 70, 
        borderRadius: 35,
        backgroundColor: '#FF9933', 
        justifyContent: 'center', 
        alignItems: 'center',
        marginBottom: 25,
    },
    surveyModalMessage: {
        fontSize: 18, 
        color: '#1C2A39', 
        textAlign: 'center',
        marginBottom: 30, 
        lineHeight: 28, 
        fontWeight: '500',
    },
    surveyModalHighlightBold: { 
        fontWeight: 'bold', 
        color: '#1C2A39' 
    },
    surveyModalHighlight: { 
        fontWeight: 'bold', 
        color: '#FF7E1D' 
    },
    surveyModalButtonContainer: { 
        width: '100%' 
    },
    surveyModalButtonGradient: {
        paddingVertical: 15, 
        borderRadius: 10, 
        alignItems: 'center',
    },
    surveyModalButtonText: {
        color: '#fff', 
        fontSize: 18, 
        fontWeight: 'bold',
    },
});

export default FillerDashboardScreen;