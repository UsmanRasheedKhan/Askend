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

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    
    try {
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    } catch (error) {
        console.error('Error calculating age:', error);
        return null;
    }
};

// Helper function to check if user matches all demographic filters
const checkDemographicFilters = (userProfile, surveyFilters) => {
    if (!surveyFilters || Object.keys(surveyFilters).length === 0) {
        return true; // No filters means survey is open to all
    }

    try {
        // 1. Check Gender
        if (surveyFilters.gender && userProfile.gender) {
            if (surveyFilters.gender !== userProfile.gender) {
                console.log(`❌ Gender mismatch: Survey wants ${surveyFilters.gender}, User is ${userProfile.gender}`);
                return false;
            }
        }

        // 2. Check Age Range
        if (userProfile.age !== null && userProfile.age !== undefined) {
            if (surveyFilters.min_age && userProfile.age < surveyFilters.min_age) {
                console.log(`❌ Age too low: User age ${userProfile.age}, Min required ${surveyFilters.min_age}`);
                return false;
            }
            if (surveyFilters.max_age && userProfile.age > surveyFilters.max_age) {
                console.log(`❌ Age too high: User age ${userProfile.age}, Max allowed ${surveyFilters.max_age}`);
                return false;
            }
        }

        // 3. Check Education
        if (surveyFilters.education && userProfile.education) {
            const educationLevels = ['primary', 'secondary', 'high_school', 'bachelors', 'masters', 'phd'];
            const userEduIndex = educationLevels.indexOf(userProfile.education.toLowerCase());
            const requiredEduIndex = educationLevels.indexOf(surveyFilters.education.toLowerCase());
            
            if (userEduIndex !== -1 && requiredEduIndex !== -1 && userEduIndex < requiredEduIndex) {
                console.log(`❌ Education mismatch: User has ${userProfile.education}, Required ${surveyFilters.education}`);
                return false;
            }
        }

        // 4. Check Profession
        if (surveyFilters.profession && userProfile.profession) {
            if (Array.isArray(surveyFilters.profession)) {
                // Multiple professions allowed
                if (!surveyFilters.profession.includes(userProfile.profession)) {
                    console.log(`❌ Profession not in allowed list: ${userProfile.profession}`);
                    return false;
                }
            } else if (surveyFilters.profession !== userProfile.profession) {
                console.log(`❌ Profession mismatch: User is ${userProfile.profession}, Required ${surveyFilters.profession}`);
                return false;
            }
        }

        // 5. Check Marital Status
        if (surveyFilters.marital_status && userProfile.marital_status) {
            if (Array.isArray(surveyFilters.marital_status)) {
                if (!surveyFilters.marital_status.includes(userProfile.marital_status)) {
                    console.log(`❌ Marital status not allowed: ${userProfile.marital_status}`);
                    return false;
                }
            } else if (surveyFilters.marital_status !== userProfile.marital_status) {
                console.log(`❌ Marital status mismatch: User is ${userProfile.marital_status}, Required ${surveyFilters.marital_status}`);
                return false;
            }
        }

        // 6. Check Location (if provided)
        if (surveyFilters.location && userProfile.city) {
            if (Array.isArray(surveyFilters.location)) {
                if (!surveyFilters.location.includes(userProfile.city)) {
                    console.log(`❌ Location not allowed: ${userProfile.city}`);
                    return false;
                }
            } else if (surveyFilters.location !== userProfile.city) {
                console.log(`❌ Location mismatch: User in ${userProfile.city}, Required ${surveyFilters.location}`);
                return false;
            }
        }

        // 7. Check Income Range (if provided)
        if (surveyFilters.min_income && userProfile.monthly_income) {
            if (userProfile.monthly_income < surveyFilters.min_income) {
                console.log(`❌ Income too low: User income ${userProfile.monthly_income}, Min required ${surveyFilters.min_income}`);
                return false;
            }
        }
        if (surveyFilters.max_income && userProfile.monthly_income) {
            if (userProfile.monthly_income > surveyFilters.max_income) {
                console.log(`❌ Income too high: User income ${userProfile.monthly_income}, Max allowed ${surveyFilters.max_income}`);
                return false;
            }
        }

        return true; // All filters passed

    } catch (error) {
        console.error('Error checking demographic filters:', error);
        return true; // If error, show survey anyway (fail-safe)
    }
};

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
// ✅ GREEN PROFILE COMPLETION CARD
// ----------------------------------------------------
const GreenProfileCompletionCard = ({ 
    isProfileComplete, 
    showGreenCard,
    navigation 
}) => {
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
                
                <MaterialIcons name="check-circle" size={24} color="#38C172" />
            </View>
        </TouchableOpacity>
    );
};

// ----------------------------------------------------
// ✅ REGULAR PROFILE CARD (INCOMPLETE)
// ----------------------------------------------------
const RegularProfileCard = ({ isProfileComplete, navigation }) => {
    if (isProfileComplete) {
        return null;
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
// ✅ AVAILABLE SURVEY CARD
// ----------------------------------------------------
const AvailableSurveyCard = ({ survey, onPress, completed, allowViewing = false }) => {
    const cardGradientColors = completed ? ['#38C172', '#69e09d'] : ['#FF7E1D', '#FFD464'];
    const cardIcon = completed ? 'check-circle' : 'description';
    const cardBorderColor = completed ? '#38C172' : '#FF7E1D';
    const cardBackgroundColor = completed ? '#38C17224' : '#F6B93B24';
    const cardDisabled = completed && !allowViewing;
    
    let surveyDescription = survey.description || 'Complete this survey and earn rewards';
    if (completed) {
        surveyDescription = 'You have completed this survey. Thank you!';
    }
    
    // Calculate progress
    const progressPercentage = survey.totalResponses > 0 
        ? (survey.responsesCollected / survey.totalResponses) * 100 
        : 0;
    
    // Check if survey has demographic filters
    const hasFilters = survey.demographicFilters && 
                      Object.keys(survey.demographicFilters).length > 0;
    
    return (
        <TouchableOpacity 
            style={[
                styles.surveyCard, 
                { 
                    backgroundColor: cardBackgroundColor, 
                    borderColor: cardBorderColor 
                }
            ]}
            onPress={cardDisabled ? undefined : onPress}
            disabled={cardDisabled}
            activeOpacity={cardDisabled ? 1 : 0.8}
        >
            <View style={styles.cardHeader}>
                <LinearGradient
                    colors={cardGradientColors}
                    style={styles.iconGradientContainer}
                >
                    <MaterialIcons 
                        name={cardIcon} 
                        size={24} 
                        color="#fff" 
                    />
                </LinearGradient>
                
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                        {survey.title}
                    </Text>
                    <View style={styles.categoryRow}>
                        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(survey.category) }]}>
                            <Text style={styles.categoryBadgeText}>{survey.category || 'General'}</Text>
                        </View>
                        
                        {hasFilters && (
                            <View style={styles.filterBadge}>
                                <MaterialCommunityIcons name="filter" size={12} color="#FF7E1D" />
                                <Text style={styles.filterBadgeText}>Filtered</Text>
                            </View>
                        )}
                    </View>
                </View>
                
                <View style={styles.priceContainer}>
                    <MaterialIcons name="account-balance-wallet" size={16} color={completed ? '#38C172' : '#FF7E1D'} />
                    <Text style={[styles.priceText, { color: completed ? '#38C172' : '#FF7E1D' }]}>
                        Rs {survey.price || '0'}
                    </Text>
                </View>
            </View>
            
            <Text style={styles.cardDescription} numberOfLines={2}>
                {surveyDescription}
            </Text>
            
            {/* Show demographic filters if any */}
            {hasFilters && (
                <View style={styles.filtersContainer}>
                    <Text style={styles.filtersTitle}>Requirements:</Text>
                    <View style={styles.filtersList}>
                        {survey.demographicFilters.gender && (
                            <View style={styles.filterChip}>
                                <MaterialCommunityIcons name="gender-male-female" size={12} color="#666" />
                                <Text style={styles.filterChipText}>{survey.demographicFilters.gender}</Text>
                            </View>
                        )}
                        {(survey.demographicFilters.min_age || survey.demographicFilters.max_age) && (
                            <View style={styles.filterChip}>
                                <MaterialIcons name="cake" size={12} color="#666" />
                                <Text style={styles.filterChipText}>
                                    {survey.demographicFilters.min_age || 0}-{survey.demographicFilters.max_age || '∞'} yrs
                                </Text>
                            </View>
                        )}
                        {survey.demographicFilters.education && (
                            <View style={styles.filterChip}>
                                <MaterialIcons name="school" size={12} color="#666" />
                                <Text style={styles.filterChipText}>{survey.demographicFilters.education}</Text>
                            </View>
                        )}
                    </View>
                </View>
            )}
            
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View 
                        style={[
                            styles.progressFill,
                            { 
                                width: `${Math.min(progressPercentage, 100)}%`,
                                backgroundColor: progressPercentage >= 100 ? '#4CAF50' : '#FF7E1D'
                            }
                        ]}
                    />
                </View>
                <Text style={styles.progressText}>
                    {survey.responsesCollected}/{survey.totalResponses} responses
                </Text>
            </View>
            
            <View style={styles.cardFooter}>
                <View style={styles.timeEstimate}>
                    <MaterialCommunityIcons name="timer-outline" size={14} color="#666" />
                    <Text style={styles.timeText}>~5 mins</Text>
                </View>
                
                {completed ? (
                    allowViewing ? (
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={onPress}
                        >
                            <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.actionButtonGradient}>
                                <MaterialIcons name="visibility" size={16} color="#fff" />
                                <Text style={styles.actionButtonText}>View Answers</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <View style={[styles.actionButton, {backgroundColor: '#38C172'}]}>
                            <MaterialIcons name="check" size={16} color="#fff" />
                            <Text style={styles.actionButtonText}>Completed</Text>
                        </View>
                    )
                ) : (
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={onPress}
                    >
                        <LinearGradient colors={['#FF7E1D', '#FFD464']} style={styles.actionButtonGradient}>
                            <MaterialIcons name="play-arrow" size={16} color="#fff" />
                            <Text style={styles.actionButtonText}>Start</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
};

// Helper function for category colors
const getCategoryColor = (category) => {
    const colors = {
        'Customer Feedback': '#FF6B6B',
        'Market Research': '#4ECDC4',
        'Employee Satisfaction': '#45B7D1',
        'Product Feedback': '#96CEB4',
        'Academic Research': '#FFEAA7',
        'Event Feedback': '#DDA0DD',
        'Healthcare Survey': '#98D8C8',
        'User Experience': '#F7DC6F',
        'Brand Awareness': '#BB8FCE',
        'Social Research': '#85C1E9'
    };
    return colors[category] || '#FF7E1D';
};

const parseJsonColumn = (value, fallback) => {
    if (!value && value !== 0) {
        return fallback;
    }

    if (Array.isArray(value) || typeof value === 'object') {
        return value;
    }

    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return parsed ?? fallback;
        } catch (error) {
            console.warn('Failed to parse JSON column:', error);
            return fallback;
        }
    }

    return fallback;
};

const parseSurveyQuestions = (rawQuestions) => {
    const parsed = parseJsonColumn(rawQuestions, []);
    if (Array.isArray(parsed)) {
        return parsed;
    }
    if (parsed && typeof parsed === 'object') {
        return Object.values(parsed);
    }
    return [];
};

const parseDemographicFilters = (rawFilters) => {
    const parsed = parseJsonColumn(rawFilters, {});
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
    }
    return {};
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
    const [completedResponsesMap, setCompletedResponsesMap] = useState(new Map());
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userName, setUserName] = useState('');
    const [userProfile, setUserProfile] = useState(null);
    
    // ✅ NEW: Green card visibility state
    const [showGreenProfileCard, setShowGreenProfileCard] = useState(false);
    const [hasShownGreenCard, setHasShownGreenCard] = useState(false);
    const [greenCardTimer, setGreenCardTimer] = useState(null);
    
    // ✅ NEW: Available surveys count
    const [surveyTab, setSurveyTab] = useState('available');

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
        if (hasShownGreenCard) {
            return;
        }

        setShowGreenProfileCard(true);
        markGreenCardAsShown();
        
        const timer = setTimeout(() => {
            setShowGreenProfileCard(false);
        }, 120000);
        
        setGreenCardTimer(timer);
    };

    // --- Fetch User Profile with ALL fields ---
    const fetchUserProfile = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                return null;
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
                return null;
            }

            const data = await response.json();
            
            if (data && data.length > 0) {
                const profile = data[0];
                
                // Set user name
                if (profile.full_name && profile.full_name.trim() !== '') {
                    const firstName = profile.full_name.split(' ')[0];
                    setUserName(firstName);
                } else {
                    setUserName('');
                }
                
                // Calculate age from date_of_birth
                const age = calculateAge(profile.date_of_birth);
                
                // Check profile completion
                const requiredFields = ['full_name', 'gender', 'date_of_birth', 'marital_status', 
                                      'mobile_number', 'cnic_number', 'education', 'profession'];
                
                const filledFields = requiredFields.filter(field => 
                    profile[field] && profile[field].toString().trim() !== ''
                );
                
                const isComplete = filledFields.length === requiredFields.length;
                setIsProfileComplete(isComplete);
                
                // Create complete user profile object for filtering
                const userProfileData = {
                    gender: profile.gender,
                    age: age,
                    education: profile.education,
                    profession: profile.profession,
                    marital_status: profile.marital_status,
                    city: profile.city,
                    monthly_income: profile.monthly_income,
                    // Add more fields as needed
                };
                
                setUserProfile(userProfileData);
                return userProfileData;
            }
            
            return null;
            
        } catch (error) {
            console.error('❌ Error fetching user profile:', error);
            return null;
        }
    }, []);

    const fetchCompletedSurveys = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return { ids: new Set(), responses: new Map(), totalReward: 0 };

            const response = await fetch(
                `${SURVEY_RESPONSES_URL}?user_id=eq.${session.user.id}&select=survey_id,response_data,reward_amount`,
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
                const completedIds = new Set();
                const responsesMap = new Map();
                let totalReward = 0;

                data.forEach(item => {
                    const surveyId = item?.survey_id ? item.survey_id.toString() : null;
                    if (surveyId) {
                        completedIds.add(surveyId);
                        const parsedResponse = parseJsonColumn(item?.response_data, []);
                        responsesMap.set(surveyId, parsedResponse);
                    }

                    const rewardAmount = Number(item?.reward_amount) || 0;
                    totalReward += rewardAmount;
                });

                return { ids: completedIds, responses: responsesMap, totalReward };
            } else {
                return { ids: new Set(), responses: new Map(), totalReward: 0 };
            }
        } catch (error) {
            console.error('❌ Error fetching completed surveys:', error);
            return { ids: new Set(), responses: new Map(), totalReward: 0 };
        }
    }, []);

    const fetchAvailableSurveys = useCallback(async (userProfileData) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    console.log('🔍 SIMPLE DEBUG: Fetching surveys...');
    
    const token = session.access_token;
    
    // ✅ SIMPLIFIED QUERY: Sirf published surveys
        const surveysResponse = await fetch(
            `${SURVEYS_URL}?select=id,title,description,category,price,responses_collected,total_responses,created_at,is_public_form,questions,demographic_filters&status=eq.published&order=created_at.desc`, 
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!surveysResponse.ok) {
      console.error('Query failed:', await surveysResponse.text());
      return [];
    }

    let surveys = await surveysResponse.json();
    console.log(`✅ Found ${surveys.length} published surveys`);
    
    // ✅ SIMPLE FILTER: Sirf public surveys
    let filteredSurveys = surveys.filter(survey => {
      console.log(`Survey "${survey.title}": is_public_form = ${survey.is_public_form}`);
      return survey.is_public_form === true;
    });
    
    console.log(`✅ ${filteredSurveys.length} public surveys`);
    
    // Show murkssayings surveys
    const murkSurveys = filteredSurveys.filter(s => 
      s.user_id === '23b58383-05f6-4d01-8642-38af876606ed'
    );
    console.log(`🎯 murkssayings public surveys: ${murkSurveys.length}`);
    murkSurveys.forEach(s => {
      console.log(`   - "${s.title}" (ID: ${s.id})`);
    });
    
        return filteredSurveys.map(survey => {
            const parsedQuestions = parseSurveyQuestions(survey.questions);
            const parsedFilters = parseDemographicFilters(survey.demographic_filters);
            return ({
      id: survey.id.toString(),
      title: survey.title || "Untitled Survey",
      description: survey.description || "No description provided",
      category: survey.category || "General",
      price: survey.price || 0,
      responsesCollected: survey.responses_collected || 0,
      totalResponses: survey.total_responses || 100,
      createdAt: survey.created_at || new Date().toISOString(),
      isPublicForm: survey.is_public_form || false,
      status: 'published',
                questions: parsedQuestions,
                demographicFilters: parsedFilters
            });
        });
    
  } catch (error) {
    console.error('❌ Simple fetch error:', error);
    return [];
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
            const [userProfileData, completedSurveysResult] = await Promise.all([
                fetchUserProfile(),
                fetchCompletedSurveys()
            ]);
            
            if (userProfileData) {
                const availableSurveysData = await fetchAvailableSurveys(userProfileData);
                setAvailableSurveys(availableSurveysData);
            }
            
            if (completedSurveysResult) {
                setCompletedSurveyIds(completedSurveysResult.ids || new Set());
                setCompletedResponsesMap(completedSurveysResult.responses || new Map());
                setWalletBalance(completedSurveysResult.totalReward || 0);
            } else {
                setWalletBalance(0);
            }
            
        } catch (error) {
            console.error('❌ Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    }, [fetchUserProfile, fetchCompletedSurveys, fetchAvailableSurveys]);

    // --- Effects ---
    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    useEffect(() => {
        const { 
            awardedAmount, 
            isProfileComplete: profileCompleteStatus, 
            showSurveyUnlockPopup,
            showGreenProfileCard: showGreenCard,
            refreshKey,
            defaultSurveyTab,
            successSurveyTitle
        } = route.params || {};

        let needsParamClear = false;

        if (profileCompleteStatus !== undefined) {
            setIsProfileComplete(profileCompleteStatus);
        }

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

        if (showGreenCard && !hasShownGreenCard) {
            showTemporaryGreenCard();
            needsParamClear = true;
        }

        if (defaultSurveyTab) {
            setSurveyTab(defaultSurveyTab);
            needsParamClear = true;
        }

        if (refreshKey) {
            loadDashboardData();
            needsParamClear = true;
        }

        if (successSurveyTitle) {
            // Alert.alert('Survey Filled', `"${successSurveyTitle}" moved to Filled tab.`);
            needsParamClear = true;
        }
        
        if (needsParamClear) {
            navigation.setParams({ 
                awardedAmount: undefined,
                showSurveyUnlockPopup: false,
                showGreenProfileCard: undefined,
                refreshKey: undefined,
                defaultSurveyTab: undefined,
                successSurveyTitle: undefined
            });
        }
    }, [route.params, navigation, hasShownGreenCard, loadDashboardData]);

    // Handle survey click
    const handleSurveyClick = (survey) => {
        if (completedSurveyIds.has(survey.id)) {
            Alert.alert('Already Completed', 'You have already completed this survey.');
            return;
        }
        
        // Navigate to survey filling screen
        navigation.navigate('FillSurveyScreen', { 
            surveyId: survey.id,
            survey: survey
        });
    };

    const handleViewSubmission = (survey) => {
        const savedResponses = completedResponsesMap.get(survey.id) || [];
        navigation.navigate('ViewPublishedSurveyScreen', {
            surveyId: survey.id,
            survey,
            mode: 'view-submission',
            readonlyResponses: savedResponses,
        });
    };

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

        const upcomingSurveys = availableSurveys.filter((survey) => !completedSurveyIds.has(survey.id));
        const filledSurveysList = availableSurveys.filter((survey) => completedSurveyIds.has(survey.id));
        const isAvailableTab = surveyTab === 'available';
        const listToRender = isAvailableTab ? upcomingSurveys : filledSurveysList;
        const sectionTitleText = isAvailableTab
            ? `Available Surveys (${upcomingSurveys.length})`
            : `Filled Surveys (${filledSurveysList.length})`;

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
                {/* ✅ 1. GREEN Profile Card */}
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

                {/* ✅ 3. AVAILABLE SURVEYS SECTION */}
                {isProfileComplete ? (
                    <>
                        <View style={styles.tabSwitcher}>
                            <TouchableOpacity
                                style={[styles.tabChip, isAvailableTab && styles.tabChipActive]}
                                onPress={() => setSurveyTab('available')}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.tabChipText, isAvailableTab && styles.tabChipTextActive]}>Available</Text>
                                <View style={[styles.tabChipCounter, isAvailableTab && styles.tabChipCounterActive]}>
                                    <Text style={[styles.tabChipCounterText, isAvailableTab && styles.tabChipCounterTextActive]}>
                                        {upcomingSurveys.length}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tabChip, !isAvailableTab && styles.tabChipActive]}
                                onPress={() => setSurveyTab('filled')}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.tabChipText, !isAvailableTab && styles.tabChipTextActive]}>Filled</Text>
                                <View style={[styles.tabChipCounter, !isAvailableTab && styles.tabChipCounterActive]}>
                                    <Text style={[styles.tabChipCounterText, !isAvailableTab && styles.tabChipCounterTextActive]}>
                                        {filledSurveysList.length}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="clipboard-check-outline" size={24} color="#FF7E1D" />
                            <Text style={styles.sectionTitle}>{sectionTitleText}</Text>
                        </View>
                        
                        {isAvailableTab && userProfile && (
                            <View style={styles.profileInfo}>
                                <MaterialCommunityIcons name="account-details" size={18} color="#666" />
                                <Text style={styles.profileInfoText}>
                                    Showing surveys matching your profile: {userProfile.gender}, {userProfile.age} yrs
                                </Text>
                            </View>
                        )}
                        
                        {listToRender.length > 0 ? (
                            <>
                                {listToRender.map((survey) => {
                                    const isCompleted = completedSurveyIds.has(survey.id);
                                    const allowViewing = !isAvailableTab && isCompleted;
                                    const onPressHandler = allowViewing
                                        ? () => handleViewSubmission(survey)
                                        : () => handleSurveyClick(survey);

                                    return (
                                        <AvailableSurveyCard
                                            key={survey.id}
                                            survey={survey}
                                            completed={isCompleted}
                                            allowViewing={allowViewing}
                                            onPress={onPressHandler}
                                        />
                                    );
                                })}
                            </>
                        ) : (
                            <View style={styles.emptySurveysContainer}>
                                <MaterialIcons name={isAvailableTab ? 'search-off' : 'check-circle'} size={50} color="#ddd" />
                                <Text style={styles.emptySurveysText}>
                                    {isAvailableTab ? 'No matching surveys found' : 'No filled surveys yet'}
                                </Text>
                                <Text style={styles.emptySurveysSubtext}>
                                    {isAvailableTab
                                        ? (userProfile
                                            ? `No surveys match your profile criteria (${userProfile.gender}, ${userProfile.age} yrs).`
                                            : 'Complete your profile to see available surveys.')
                                        : 'Completed surveys will appear here once you submit responses.'}
                                </Text>
                                {isAvailableTab && (
                                    <TouchableOpacity 
                                        style={styles.refreshButton}
                                        onPress={onRefresh}
                                    >
                                        <MaterialIcons name="refresh" size={20} color="#FF7E1D" />
                                        <Text style={styles.refreshButtonText}>Refresh</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </>
                ) : (
                    <View style={styles.surveysLockedContainer}>
                        <MaterialIcons name="lock" size={40} color="#FF7E1D" style={styles.lockIcon} />
                        <Text style={styles.surveysLockedTitle}>Surveys Locked</Text>
                        <Text style={styles.surveysLockedText}>
                            Complete your profile to unlock available surveys
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
// 🎨 STYLES
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
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F8FF',
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#D1E8FF',
    },
    profileInfoText: {
        fontSize: 13,
        color: '#2C5282',
        marginLeft: 8,
        flex: 1,
    },

    tabSwitcher: {
        flexDirection: 'row',
        backgroundColor: '#FFF5EC',
        borderRadius: 16,
        padding: 6,
        borderWidth: 1,
        borderColor: '#FFE0BF',
        marginTop: 10,
        marginBottom: 10,
    },
    tabChip: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
    },
    tabChipActive: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#FFD19B',
        shadowColor: '#FF7E1D',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    tabChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#AA5A16',
    },
    tabChipTextActive: {
        color: '#FF7E1D',
    },
    tabChipCounter: {
        minWidth: 32,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFE3C7',
        paddingHorizontal: 8,
    },
    tabChipCounterActive: {
        backgroundColor: '#FF7E1D',
    },
    tabChipCounterText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#C0762E',
    },
    tabChipCounterTextActive: {
        color: '#fff',
    },

    // --- CARD STYLES ---
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
    
    // Survey Card
    surveyCard: {
        borderWidth: 1.5, 
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
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
        marginBottom: 10,
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
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    cardDescription: {
        fontSize: 13,
        color: '#666',
        marginBottom: 10,
        lineHeight: 18,
    },
    
    // Category row
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3,
    },
    
    // Category badge
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        marginRight: 8,
    },
    categoryBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
    },
    
    // Filter badge
    filterBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5E6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FFD464',
    },
    filterBadgeText: {
        fontSize: 9,
        color: '#FF7E1D',
        marginLeft: 3,
        fontWeight: '500',
    },
    
    iconGradientContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    
    // Price container
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    
    // Filters container
    filtersContainer: {
        backgroundColor: '#F8F9FA',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    filtersTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#495057',
        marginBottom: 6,
    },
    filtersList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: '#DEE2E6',
    },
    filterChipText: {
        fontSize: 10,
        color: '#495057',
        marginLeft: 4,
    },
    
    // Progress container
    progressContainer: {
        marginBottom: 10,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 5,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 11,
        color: '#666',
    },
    
    // Card Footer
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timeEstimate: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 5,
    },
    
    // Action button
    actionButton: {
        borderRadius: 15,
        overflow: 'hidden',
    },
    actionButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
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
    
    // Empty surveys
    emptySurveysContainer: { 
        alignItems: 'center', 
        paddingVertical: 40,
        backgroundColor: '#FFF9F0',
        borderRadius: 15,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#FFE4CC',
    },
    emptySurveysText: {
        fontSize: 18, 
        fontWeight: '600', 
        color: '#FF7E1D',
        marginTop: 15,
    },
    emptySurveysSubtext: {
        fontSize: 14, 
        color: '#666', 
        marginTop: 5,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 20,
    },
    
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#FFD464',
        marginTop: 15,
    },
    refreshButtonText: {
        fontSize: 14,
        color: '#FF7E1D',
        fontWeight: '600',
        marginLeft: 8,
    },
    
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