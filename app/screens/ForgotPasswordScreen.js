import React, { useState } from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    ActivityIndicator,
    Alert,
    SafeAreaView, // Added for better iOS layout
    KeyboardAvoidingView, // Added for better keyboard handling
    Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

// ⚠️ CRITICAL CONFIGURATION ⚠️
// Replace these with your actual Supabase details
// GOTRUE_API_URL should point to your project's GoTrue (Auth) API endpoint
const GOTRUE_API_URL = 'https://oyavjqycsjfcnzlshdsu.supabase.co/auth/v1/recover'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95YXZqcXljc2pmY256bHNoZHN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNTgwMjcsImV4cCI6MjA3NTczNDAyN30.22cwyIWSBmhLefCvobdbH42cPSTnw_NmSwbwaYvyLy4'; // Use your actual anon key

const API_HEADERS = { 
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY 
};

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [message, setMessage] = useState('');

    // --- VALIDATION ---
    const validateEmail = () => {
        if (!email.trim()) {
            setEmailError('Email is required.');
            return false;
        }
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            setEmailError('Please enter a valid email format.');
            return false;
        }
        setEmailError('');
        return true;
    };

    // ----------------------------------------------------
    // 🔑 SUPABASE AUTH REST API CALL (Password Recovery)
    // ----------------------------------------------------
    const handleForgotPassword = async () => {
        if (!validateEmail()) {
            return;
        }

        setIsLoading(true);
        setMessage('');

        // 1. Prepare Payload
        const payload = {
            email: email,
            // ⚠️ IMPORTANT: Aapko yahan par apne redirect URL ko configure karna padega.
            // Jab user email link par click karega, woh is URL par redirect hoga.
            // Yeh URL aapki app ki deep link ya website ka URL ho sakta hai.
            // Example:
            // email_redirect_to: Platform.OS === 'ios' ? 'yourapp://reset-password' : 'yourapp://reset-password'
            // Ya sirf ek website URL:
             //email_redirect_to: 'askend://',
        };

        try {
            const response = await fetch(GOTRUE_API_URL, {
                method: 'POST',
                headers: API_HEADERS,
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                console.log('✅ Password recovery request successfully sent.');
                setMessage('Success! Check your email for the password reset link.');
                // Optionally, navigate back after a short delay
                // setTimeout(() => navigation.goBack(), 5000); 
            } else {
                const errorData = await response.json(); // Supabase often returns JSON errors
                console.error('🔴 Auth REST API Error:', errorData); 
                setMessage(errorData.message || 'Error sending link. Please try again.');
                Alert.alert("Error", errorData.message || `Could not send reset link. Status: ${response.status}`);
            }

        } catch (e) {
            console.error('General Fetch Error:', e);
            setMessage('A network error occurred.');
            Alert.alert("System Error", "An unexpected error occurred. Check connection.");
        } finally {
            setIsLoading(false);
        }
    };


    // ----------------------------------------------------
    // 🎨 RENDER UI (Matching your reference image)
    // ----------------------------------------------------
    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView 
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                {/* Background Gradient / Color */}
                <LinearGradient
                    colors={['#FF7E1D', '#FFD464']} // Matching your background gradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.backgroundGradient}
                >
                    <View style={styles.card}>
                        {/* Mail Icon */}
                        <LinearGradient
                            colors={['#FF7E1D', '#FFD464']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.iconCircle}
                        >
                            <MaterialIcons name="email" size={50} color="#fff" />
                            {/* Checkmark overlay for completed state if needed */}
                            {/* <View style={styles.checkmarkOverlay}>
                                <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                            </View> */}
                        </LinearGradient>

                        <Text style={styles.title}>Forgot Password?</Text>
                        
                        <Text style={styles.subtitle}>
                            No worries! Enter your email address and we'll send you a link to reset your password.
                        </Text>

                        {/* Email Input */}
                        <Text style={styles.inputLabel}>Email Address</Text>
                        <TextInput
                            style={[styles.textInput, emailError && styles.inputErrorBorder]}
                            placeholder="Enter your email address"
                            placeholderTextColor="#a0a0a0"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            onBlur={validateEmail}
                            editable={!isLoading}
                        />
                        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                        
                        {/* Success/Error Message */}
                        {message ? (
                            <Text style={[styles.messageText, message.startsWith('Success') ? styles.successText : styles.errorText]}>
                                {message}
                            </Text>
                        ) : null}

                        {/* Send Reset Link Button */}
                        <TouchableOpacity 
                            onPress={handleForgotPassword} 
                            style={styles.sendButtonContainer}
                            disabled={isLoading}
                        >
                            <LinearGradient
                                colors={['#FFD464', '#FF7E1D']} // Inverted gradient for the button as per reference
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={[styles.sendButtonGradient, isLoading && { opacity: 0.6 }]}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.sendButtonText}>Send Reset Link</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Back to Sign In */}
                        <TouchableOpacity 
                            onPress={() => navigation.goBack()} 
                            style={styles.backButton}
                            disabled={isLoading}
                        >
                            <MaterialIcons name="arrow-back" size={20} color="#666" />
                            <Text style={styles.backButtonText}>Back to Sign In</Text>
                        </TouchableOpacity>

                    </View>
                </LinearGradient>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

// ----------------------------------------------------
// 🎨 STYLES (Matching your reference image)
// ----------------------------------------------------

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FCF3E7', // Main background if gradient doesn't cover fully
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    backgroundGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: '90%', // Increased width slightly
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: 30, // More rounded corners
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 }, // Stronger shadow
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 10,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
        shadowColor: '#FF7E1D', // Shadow for the icon circle
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    // checkmarkOverlay: { // Optional: For a checkmark on success
    //     position: 'absolute',
    //     bottom: -5,
    //     right: -5,
    //     backgroundColor: '#fff',
    //     borderRadius: 15,
    //     padding: 2,
    //     shadowColor: '#000',
    //     shadowOffset: { width: 0, height: 1 },
    //     shadowOpacity: 0.2,
    //     shadowRadius: 2,
    // },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#777',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 20,
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#555', 
        alignSelf: 'flex-start', // Align to left
        marginBottom: 8,
        marginTop: 15,
    },
    textInput: {
        width: '100%',
        height: 50,
        backgroundColor: '#f0f0f0', // Lighter background for input
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
        borderWidth: 1, 
        borderColor: '#e0e0e0', // Subtle border
    },
    inputErrorBorder: {
        borderColor: '#FF3B30',
        backgroundColor: '#FFF8F8',
    },
    errorText: {
        fontSize: 12,
        color: '#FF3B30',
        marginTop: 5,
        fontWeight: '500',
        alignSelf: 'flex-start',
    },
    successText: {
        fontSize: 14,
        color: '#28A745',
        marginTop: 15,
        fontWeight: '600',
        textAlign: 'center',
    },
    messageText: {
        marginTop: 10,
        marginBottom: 10,
        width: '100%',
    },
    
    sendButtonContainer: {
        marginTop: 30,
        width: '100%',
    },
    sendButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 30,
        shadowColor: '#FF7E1D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 5,
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    backButton: {
        marginTop: 25,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    backButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    }
});

export default ForgotPasswordScreen;