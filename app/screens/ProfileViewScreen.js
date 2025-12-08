import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../supabaseClient';

// ✅ CORRECT API ENDPOINTS
const SUPABASE_URL = 'https://oyavjqycsjfcnzlshdsu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95YXZqcXljc2pmY256bHNoZHN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNTgwMjcsImV4cCI6MjA3NTczNDAyN30.22cwyIWSBmhLefCvobdbH42cPSTnw_NmSwbwaYvyLy4';

const USER_PROFILES_URL = `${SUPABASE_URL}/rest/v1/user_profiles`;

// Info Row Component (without icons)
const InfoRow = ({ label, value }) => {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value || 'Not provided'}</Text>
        </View>
    );
};

// Section Header Component (with icons)
const SectionHeader = ({ title, iconName }) => (
    <View style={styles.sectionHeader}>
        <MaterialIcons name={iconName} size={20} color="#FF7E1D" />
        <Text style={styles.sectionTitle}>{title}</Text>
    </View>
);

// Bottom Tab Item Component
const TabItem = ({ iconName, label, isCurrent, onPress }) => (
    <TouchableOpacity 
        style={styles.tabItem} 
        onPress={onPress}
        activeOpacity={0.7}
    >
        <MaterialCommunityIcons
            name={iconName}
            size={24}
            color={isCurrent ? "#fff" : "rgba(255, 255, 255, 0.6)"}
        />
        <Text
            style={[
                styles.tabLabel,
                { color: isCurrent ? "#fff" : "rgba(255, 255, 255, 0.6)" },
            ]}
        >
            {label}
        </Text>
    </TouchableOpacity>
);

// Get user initials from name
const getUserInitials = (fullName) => {
    if (!fullName) return 'U';
    const names = fullName.split(' ');
    if (names.length >= 2) {
        return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase();
};

// Profile View Screen
const ProfileViewScreen = ({ navigation }) => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState('');
    const [userInitials, setUserInitials] = useState('U');

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError || !session) {
                Alert.alert('Session Expired', 'Please sign in again.');
                navigation.navigate('SignIn');
                return;
            }

            // Set user email from session
            setUserEmail(session.user.email || '');

            const response = await fetch(
                `${USER_PROFILES_URL}?user_id=eq.${session.user.id}`,
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
                if (data.length > 0) {
                    const profile = data[0];
                    setProfileData(profile);
                    
                    // Set user initials
                    if (profile.full_name) {
                        setUserInitials(getUserInitials(profile.full_name));
                    }
                } else {
                    Alert.alert('Profile Not Found', 'Please complete your profile first.');
                    navigation.navigate('ProfileCompletionScreen');
                }
            } else {
                Alert.alert('Error', 'Failed to fetch profile data.');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            Alert.alert('Error', 'An error occurred while loading profile.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not provided';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const formatIncome = (income) => {
        if (!income) return 'Not provided';
        return `Rs ${income.toLocaleString()}`;
    };

    const formatLocation = (location) => {
        if (!location) return 'Not provided';
        // Remove coordinates if it's in coordinate format
        if (location.includes(',')) {
            return 'Location set';
        }
        return location;
    };

    const formatHobbies = (hobbiesData) => {
        if (!hobbiesData || typeof hobbiesData !== 'object') {
            return 'Not provided';
        }
        
        let result = [];
        Object.entries(hobbiesData).forEach(([category, subcategories]) => {
            if (Array.isArray(subcategories)) {
                result.push(`${category}: ${subcategories.join(', ')}`);
            }
        });
        
        return result.length > 0 ? result.join('\n') : 'Not provided';
    };

    const handleChangePassword = () => {
        navigation.navigate('ChangePassword');
    };

    const handleNavigateToSurveys = () => {
        navigation.navigate('CreatorDashboardScreen');
    };

    const handleNavigateToWallet = () => {
        navigation.navigate('WalletScreen');
    };

    const handleNavigateToProfile = () => {
        // Already on Profile screen, no need to navigate
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Logout', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.clear();
                            await supabase.auth.signOut();
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'SignIn' }],
                            });
                        } catch (error) {
                            console.error('Logout error:', error);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF7E1D" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    if (!profileData) {
        return (
            <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={50} color="#FF7E1D" />
                <Text style={styles.errorText}>Profile not found</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchProfileData}>
                    <LinearGradient colors={['#FF7E1D', '#FFD464']} style={styles.retryButtonGradient}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with Linear Gradient */}
            <LinearGradient
                colors={['#FF7E1D', '#FFD464']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.header}
            >
                {/* Back Button and Logout in top row */}
                <View style={styles.headerTopRow}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    
                    {/* Logout button top right corner */}
                    <TouchableOpacity 
                        style={styles.logoutButtonHeader}
                        onPress={handleLogout}
                    >
                        <Text style={styles.logoutButtonHeaderText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                {/* User Info in Header - CENTERED */}
                <View style={styles.headerUserInfo}>
                    {/* User Initials Circle with Gradient */}
                    <LinearGradient
                        colors={['#FF7E1D', '#FFD464', '#8A2BE2']}
                        locations={[0, 1, 0.7]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.userInitialsCircle}
                    >
                        <Text style={styles.userInitialsText}>{userInitials}</Text>
                    </LinearGradient>
                    
                    {/* Username and Email */}
                    <View style={styles.userTextContainer}>
                        <Text style={styles.usernameText}>
                            {profileData.full_name || 'User Name'}
                        </Text>
                        <Text style={styles.userEmailText}>
                            {userEmail}
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Personal Information */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeaderContainer}>
                        <SectionHeader title="Personal Information" iconName="person-outline" />
                    </View>
                    
                    <InfoRow 
                        label="Full Name" 
                        value={profileData.full_name} 
                    />
                    <InfoRow 
                        label="Gender" 
                        value={profileData.gender} 
                    />
                    <InfoRow 
                        label="Date of Birth" 
                        value={formatDate(profileData.date_of_birth)} 
                    />
                    <InfoRow 
                        label="Marital Status" 
                        value={profileData.marital_status} 
                    />
                </View>

                {/* Contact Information */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeaderContainer}>
                        <SectionHeader title="Contact Information" iconName="contact-phone" />
                    </View>
                    
                    <InfoRow 
                        label="Mobile Number" 
                        value={profileData.mobile_number} 
                    />
                    <InfoRow 
                        label="CNIC" 
                        value={profileData.cnic_number} 
                    />
                    <InfoRow 
                        label="Location" 
                        value={formatLocation(profileData.location_coords)} 
                    />
                </View>

                {/* Professional Information */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeaderContainer}>
                        <SectionHeader title="Professional Information" iconName="work-outline" />
                    </View>
                    
                    <InfoRow 
                        label="Education" 
                        value={profileData.education} 
                    />
                    <InfoRow 
                        label="Major" 
                        value={profileData.major} 
                    />
                    <InfoRow 
                        label="Profession" 
                        value={profileData.profession} 
                    />
                    <InfoRow 
                        label="Monthly Income" 
                        value={formatIncome(profileData.monthly_income)} 
                    />
                </View>

                {/* Interests & Hobbies */}
                {profileData.hobbies_data && Object.keys(profileData.hobbies_data).length > 0 && (
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeaderContainer}>
                            <SectionHeader title="Interests & Hobbies" iconName="favorite" />
                        </View>
                        <Text style={styles.hobbiesText}>
                            {formatHobbies(profileData.hobbies_data)}
                        </Text>
                    </View>
                )}

                {/* Change Password Button */}
                <TouchableOpacity 
                    style={styles.changePasswordButton}
                    onPress={handleChangePassword}
                >
                    <LinearGradient
                        colors={['#FF7E1D', '#FFD464']}
                        style={styles.changePasswordButtonGradient}
                    >
                        <MaterialIcons name="lock" size={20} color="#fff" />
                        <Text style={styles.changePasswordButtonText}>Change Password</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Add extra padding for bottom navigation */}
                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Bottom Navigation Bar - Same as CreatorDashboardScreen */}
            <LinearGradient
                colors={["#FF7E1D", "#FFD464"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bottomNav}
            >
                <TabItem 
                    iconName="clipboard-list" 
                    label="Surveys" 
                    isCurrent={false}
                    onPress={handleNavigateToSurveys}
                />
                
                <TabItem 
                    iconName="wallet" 
                    label="Wallet" 
                    isCurrent={false}
                    onPress={handleNavigateToWallet}
                />
                
                <TabItem 
                    iconName="account" 
                    label="Profile" 
                    isCurrent={true}
                    onPress={handleNavigateToProfile}
                />
            </LinearGradient>
        </SafeAreaView>
    );
};

// ----------------------------------------------------
// 🎨 STYLES
// ----------------------------------------------------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingTop: 20,
        paddingBottom: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom:10,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: -25,
    },
    backButton: {
        padding: 8,
    },
    logoutButtonHeader: {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 16,
    },
    logoutButtonHeaderText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    headerUserInfo: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    userInitialsCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    userInitialsText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    userTextContainer: {
        alignItems: 'center',
    },
    usernameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
        textAlign: 'center',
    },
    userEmailText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#333',
        marginTop: 15,
        marginBottom: 25,
    },
    retryButton: {
        width: 150,
    },
    retryButtonGradient: {
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
        paddingTop: 20,
    },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 126, 29, 0.3)', // FF7E1D 30% opacity
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    sectionHeaderContainer: {
        backgroundColor: 'rgba(255, 212, 100, 0.15)', // #FFD464 with 15% opacity
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 15,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    label: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    value: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        textAlign: 'right',
        flex: 1,
        paddingLeft: 10,
    },
    hobbiesText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginTop: 10,
    },
    changePasswordButton: {
        marginTop: 10,
        marginBottom: 30,
    },
    changePasswordButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        elevation: 3,
    },
    changePasswordButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    bottomPadding: {
        height: 80,
    },
    // Bottom Navigation Styles
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        height: 70,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
    },
    tabItem: {
        alignItems: "center",
        padding: 5,
        flex: 1,
        justifyContent: "center",
    },
    tabLabel: {
        fontSize: 12,
        marginTop: 4,
        fontWeight: "bold",
    },
});

export default ProfileViewScreen;