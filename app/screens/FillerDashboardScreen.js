import React, { useEffect, useState } from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    Alert, 
    Modal, 
    Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// ----------------------------------------------------
// ✅ NEW COMPONENT: Survey Unlock Modal (Matching Screenshot)
// ----------------------------------------------------
const SurveyUnlockModal = ({ visible, onClose }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={modalStyles.modalOverlay}>
                <View style={modalStyles.surveyModalContent}>
                    {/* Icon Container */}
                    <View style={modalStyles.surveyIconCircle}>
                        <MaterialIcons name="description" size={35} color="#fff" />
                    </View>
                    
                    {/* Message Text */}
                    <Text style={modalStyles.surveyModalMessage}>
                        Your completed profile has 
                        unlocked new <Text style={modalStyles.surveyModalHighlightBold}>paid surveys</Text>.
                        {"\n"}
                        Complete them to <Text style={modalStyles.surveyModalHighlight}>start earning more</Text>.
                    </Text>
                    
                    {/* Got it Button */}
                    <TouchableOpacity onPress={onClose} style={modalStyles.surveyModalButtonContainer}>
                        <LinearGradient
                            colors={['#FF7E1D', '#FFD464']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={modalStyles.surveyModalButtonGradient}
                        >
                            <Text style={modalStyles.surveyModalButtonText}>Got it!</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
// ----------------------------------------------------


const FillerDashboardScreen = ({ navigation, route }) => {
    // --- State Variables ---
    const [walletBalance, setWalletBalance] = useState(0);
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    // ✅ NEW STATE for the custom modal
    const [isSurveyUnlockModalVisible, setIsSurveyUnlockModalVisible] = useState(false);

    // --- EFFECT: Handle Navigation Params (CRITICAL UPDATE) ---
    useEffect(() => {
        const { 
            awardedAmount, 
            isProfileComplete: profileCompleteStatus, 
            showSurveyUnlockPopup 
        } = route.params || {};

        let needsParamClear = false;

        // 1. Update State based on profile completion status
        if (profileCompleteStatus !== undefined) {
            setIsProfileComplete(profileCompleteStatus);
            // Profile status doesn't need to be cleared, as it's a persistent state.
        }

        // 2. Handle Awarded Amount & Wallet Update (Only runs if awardedAmount is present)
        if (awardedAmount > 0) {
            // Add the award amount (e.g., Rs 50)
            setWalletBalance(prev => prev + awardedAmount); 
            console.log(`[Dashboard] Award of Rs ${awardedAmount} added.`);
            needsParamClear = true; // Mark for clearing
        }

        // 3. Handle Survey Unlock Pop-up
        if (showSurveyUnlockPopup) {
            // ✅ Use Custom Modal State
            setIsSurveyUnlockModalVisible(true);
            console.log('[Dashboard] Showing Survey Unlock Modal.');
            needsParamClear = true; // Mark for clearing
        }
        
        // 4. ✅ CRITICAL: Clear the used parameters to prevent double addition on re-focus
        if (needsParamClear) {
            // navigation.setParams is used to modify the parameters of the current route
            navigation.setParams({ 
                awardedAmount: undefined, // Clears the reward amount
                showSurveyUnlockPopup: false // Clears the modal flag
            });
            console.log('[Dashboard] Cleared awardedAmount/popup params.');
        }

    }, [route.params, navigation]); 

    // --- Component Logic ---
    
    // Determine the content/color of the profile card
    const profileCardTitle = isProfileComplete ? 'Profile Complete' : 'Profile Form';
    const profileCardDescription = isProfileComplete
        ? 'Thank you! Your profile is complete. New surveys are now available.'
        : 'Complete your profile to unlock surveys and start earning.';
    const profileCardColor = isProfileComplete ? '#38C17224' : '#F6B93B24';
    const profileCardBorder = isProfileComplete ? '#38C172' : '#FF7E1D';
    const profileCardIcon = isProfileComplete ? 'check-circle' : 'person';


    return (
        <View style={styles.container}>
            
            {/* 1. TOP HEADER SECTION */}
            <LinearGradient
                colors={['#FF7E1D', '#FFD464']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <Text style={styles.welcomeText}>Welcome, Mariam</Text>
                    
                    {/* Wallet Button */}
                    <TouchableOpacity style={styles.walletButton}>
                        <MaterialIcons 
                            name="account-balance-wallet" 
                            size={20} 
                            color="#FF7E1D" 
                        />
                        <Text style={styles.walletText}>Rs {walletBalance}</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* 2. MAIN SCROLLABLE CONTENT */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* Available Surveys Header */}
                <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons 
                        name="clipboard-list-outline" 
                        size={24} 
                        color="#FF7E1D"
                    />
                    <Text style={styles.sectionTitle}>Available Surveys</Text>
                </View>

                {/* Profile Form Card */}
                <TouchableOpacity 
                    style={[
                        styles.card, 
                        { 
                            backgroundColor: profileCardColor, 
                            borderColor: profileCardBorder 
                        }
                    ]}
                    // Assuming 'ProfileCompletionScreen' is the parent navigator or first screen
                    onPress={() => !isProfileComplete && navigation.navigate('ProfileCompletionScreen')}
                    activeOpacity={isProfileComplete ? 1 : 0.8}
                >
                    
                    <View style={styles.cardHeader}>
                        
                        {/* ICON CONTAINER (Gradient) */}
                        <LinearGradient
                            colors={isProfileComplete ? ['#38C172', '#69e09d'] : ['#FF7E1D', '#FFD464']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.iconGradientContainer}
                        >
                            <MaterialIcons 
                                name={profileCardIcon} 
                                size={28} 
                                color="#fff" 
                            />
                        </LinearGradient>
                        
                        <Text style={styles.cardTitle}>{profileCardTitle}</Text>
                    </View>
                    
                    {/* Description */}
                    <View>
                        <Text style={styles.cardDescription}>
                            {profileCardDescription}
                        </Text>
                    </View>
                    
                    {/* SOLID GRADIENT BUTTON */}
                    {!isProfileComplete ? (
                        <LinearGradient
                            colors={['#FF7E1D', '#FFD464']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.solidCardButton}
                        >
                            <Text style={styles.cardButtonText}>+ Rs. 50</Text>
                        </LinearGradient>
                    ) : (
                        <View style={[styles.solidCardButton, {backgroundColor: '#38C172', opacity: 1, paddingHorizontal: 20}]}>
                             <Text style={styles.cardButtonText}>Completed</Text>
                        </View>
                    )}

                </TouchableOpacity>
                
                {/* Placeholder for other surveys */}
                <View style={{ height: 30 }} />
                <Text style={styles.placeholderText}>More exciting surveys coming soon!</Text>

            </ScrollView>

            {/* 3. STATIC BOTTOM NAVIGATION BAR */}
            <LinearGradient
                colors={['#FF7E1D', '#FFD464']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bottomNav}
            >
                <TabItem iconName="clipboard-list-outline" label="Surveys" isCurrent={true} />
                <TabItem iconName="wallet-outline" label="Wallet" isCurrent={false} />
                <TabItem iconName="account-circle-outline" label="Profile" isCurrent={false} />
            </LinearGradient>

            {/* ✅ 4. CUSTOM MODAL */}
            <SurveyUnlockModal
                visible={isSurveyUnlockModalVisible}
                onClose={() => setIsSurveyUnlockModalVisible(false)}
            />

        </View>
    );
};

// Component for the Static Bottom Navigation Items
const TabItem = ({ iconName, label, isCurrent }) => (
    <View style={styles.tabItem}>
        <MaterialCommunityIcons 
            name={iconName} 
            size={26}
            color={isCurrent ? '#fff' : 'rgba(255, 255, 255, 0.6)'} 
        />
        <Text style={[styles.tabLabel, { color: isCurrent ? '#fff' : 'rgba(255, 255, 255, 0.6)' }]}>
            {label}
        </Text>
    </View>
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
        elevation: 5,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#fff',
        maxWidth: '60%',
    },
    walletButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingVertical: 5, 
        paddingHorizontal: 15,
        elevation: 3,
    },
    walletText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF7E1D',
        marginLeft: 3, 
    },

    // --- Scroll Content Styles ---
    scrollContent: {
        paddingTop: 20,
        paddingHorizontal: 15, 
        paddingBottom: 100,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 0, 
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },

    // --- Card Styles ---
    card: {
        borderWidth: 1.5, 
        borderRadius: 15,
        padding: 20,
        marginBottom: 25, 
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
    
    iconGradientContainer: {
        padding: 8,
        borderRadius: 10,
        marginRight: 10,
        justifyContent: 'center', 
        alignItems: 'center',
        marginTop: 2,
    },
    
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 0, 
    },

    cardDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15, 
        lineHeight: 20,
        paddingLeft: 0, 
        flex: 1, 
    },

    solidCardButton: {
        alignSelf: 'flex-end', 
        borderRadius: 20,
        overflow: 'hidden',
        paddingVertical: 5, 
        paddingHorizontal: 15,
        elevation: 3, 
        height:35,
        justifyContent: 'center', 
        alignItems: 'center', 
    },
    
    cardButtonText: {
        color: '#fff', 
        fontWeight: 'bold',
        fontSize: 16,
    },
    placeholderText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 16,
        marginTop: 10,
    },

    // --- Bottom Navigation Styles (Static) ---
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
        elevation: 10,
    },
    tabItem: {
        alignItems: 'center',
        padding: 5,
    },
    tabLabel: {
        fontSize: 14,
        marginTop: 4,
        fontWeight: 'bold',
    },
});


// ----------------------------------------------------
// ✅ MODAL STYLES (Styles for the Custom Popup)
// ----------------------------------------------------

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
        backgroundColor: '#FF9933', // Orange background for icon
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
        shadowColor: '#FF9933',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    },
    surveyModalMessage: {
        fontSize: 18,
        color: '#1C2A39', // Dark text color
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 28,
        fontWeight: '500',
    },
    surveyModalHighlightBold: {
        fontWeight: 'bold',
        color: '#1C2A39',
    },
    surveyModalHighlight: {
        fontWeight: 'bold',
        color: '#FF7E1D', // Orange highlight
    },
    surveyModalButtonContainer: {
        width: '100%',
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