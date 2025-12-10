import React, { useState, useEffect } from 'react';
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
import { supabase } from '../../supabaseClient';

const PROFANITY_BLACKLIST = [
    'badword1',
    'swearword2',
    'idiot',
    'stupid',
    'admin',
    'password',
    '123456789',
    'qwerty',
    '111111111',
];

const MIN_PASSWORD_LENGTH = 13;
const MAX_PASSWORD_LENGTH = 128;

const createPasswordCriteria = (value) => ({
    length: value.length >= MIN_PASSWORD_LENGTH,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
    symbol: /[!@#$%^&*.]/.test(value),
});

const PasswordCriteriaItem = ({ label, met }) => {
    const color = met ? '#00A86B' : '#A9A9A9';
    return (
        <View style={styles.criteriaItem}>
            <Text style={[styles.criteriaIcon, { color }]}>{met ? '✓' : '•'}</Text>
            <Text style={[styles.criteriaLabel, { color }]}>{label}</Text>
        </View>
    );
};

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordMatchError, setPasswordMatchError] = useState('');
    const [criteria, setCriteria] = useState(createPasswordCriteria(''));
    const [statusMessage, setStatusMessage] = useState('');
    const [step, setStep] = useState('EMAIL');
    const [otpSession, setOtpSession] = useState(null);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const isBusy = isSendingOtp || isVerifyingOtp || isUpdatingPassword;

    useEffect(() => {
        if (resendCooldown <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [resendCooldown]);

    useEffect(() => {
        setCriteria(createPasswordCriteria(newPassword));

        if (!confirmPassword && !newPassword) {
            setPasswordMatchError('');
            return;
        }

        if (confirmPassword && newPassword && newPassword !== confirmPassword) {
            setPasswordMatchError('Passwords do not match.');
        } else {
            setPasswordMatchError('');
        }
    }, [newPassword, confirmPassword]);

    const normalizedEmail = () => email.trim().toLowerCase();

    const validateEmail = () => {
        const value = normalizedEmail();
        if (!value) {
            setEmailError('Email is required.');
            return false;
        }
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
            setEmailError('Please enter a valid email format.');
            return false;
        }
        setEmailError('');
        return true;
    };

    const validateOtpInput = () => {
        if (!otp.trim()) {
            setOtpError('Enter the 6-digit OTP from your email.');
            return false;
        }
        if (!/^\d{6}$/.test(otp.trim())) {
            setOtpError('OTP must be a 6-digit code.');
            return false;
        }
        setOtpError('');
        return true;
    };

    const isPasswordStrong = (criteriaObject) => Object.values(criteriaObject).every(Boolean);

    const validateNewPassword = () => {
        const trimmed = newPassword.trim();

        if (!trimmed) {
            setPasswordError('Password is required.');
            return false;
        }

        if (trimmed.length < MIN_PASSWORD_LENGTH) {
            setPasswordError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
            return false;
        }

        if (trimmed.length > MAX_PASSWORD_LENGTH) {
            setPasswordError(`Password cannot exceed ${MAX_PASSWORD_LENGTH} characters.`);
            return false;
        }

        const lowerPassword = trimmed.toLowerCase();
        const isBlacklisted = PROFANITY_BLACKLIST.some((word) => lowerPassword.includes(word));
        if (isBlacklisted) {
            setPasswordError('Avoid extremely common or weak passwords.');
            return false;
        }

        if (!isPasswordStrong(criteria)) {
            setPasswordError('Please meet all password requirements.');
            return false;
        }

        if (trimmed !== confirmPassword.trim()) {
            setPasswordError('Passwords do not match.');
            return false;
        }

        setPasswordError('');
        return true;
    };

    const handleSendOtp = async () => {
        if (!validateEmail()) {
            return;
        }

        setStatusMessage('');
        setOtp('');
        setOtpSession(null);
        setOtpError('');
        setPasswordError('');
        setPasswordMatchError('');
        setNewPassword('');
        setConfirmPassword('');
        setStep('EMAIL');
        setIsSendingOtp(true);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: normalizedEmail(),
                options: {
                    shouldCreateUser: false,
                },
            });

            if (error) {
                throw error;
            }

            setStatusMessage('OTP sent! Check your email and enter the 6-digit code.');
            setStep('OTP');
            setResendCooldown(60);
        } catch (error) {
            console.error('Error sending OTP:', error);
            Alert.alert('Could not send OTP', error.message || 'Please try again later.');
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!validateEmail() || !validateOtpInput()) {
            return;
        }

        setIsVerifyingOtp(true);
        setStatusMessage('');

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email: normalizedEmail(),
                token: otp.trim(),
                type: 'email',
            });

            if (error) {
                throw error;
            }

            if (!data?.session) {
                throw new Error('OTP verified but session was not returned.');
            }

            setOtpSession({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
            });
            setStatusMessage('OTP verified! Please set a new password.');
            setStep('RESET');
        } catch (error) {
            console.error('OTP verification failed:', error);
            Alert.alert('Invalid OTP', error.message || 'Please double-check the code and try again.');
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handlePasswordUpdate = async () => {
        if (!validateNewPassword()) {
            return;
        }

        if (!otpSession?.access_token || !otpSession?.refresh_token) {
            Alert.alert('Verification Required', 'Please verify the OTP before updating your password.');
            return;
        }

        setIsUpdatingPassword(true);

        try {
            const { error: sessionError } = await supabase.auth.setSession({
                access_token: otpSession.access_token,
                refresh_token: otpSession.refresh_token,
            });

            if (sessionError) {
                throw sessionError;
            }

            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword.trim(),
            });

            if (updateError) {
                throw updateError;
            }

            await supabase.auth.signOut();

            Alert.alert(
                'Password Updated',
                'Your password has been updated successfully. Please sign in with the new password.',
                [
                    {
                        text: 'Go to Sign In',
                        onPress: () => navigation.replace('SignIn'),
                    },
                ],
            );
        } catch (error) {
            console.error('Password update failed:', error);
            Alert.alert('Update Failed', error.message || 'Unable to update password. Please try again.');
        } finally {
            setIsUpdatingPassword(false);
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
                            Enter your email to receive an OTP. Verify it here and set a brand new password without leaving the app.
                        </Text>

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
                            editable={step === 'EMAIL' && !isSendingOtp}
                        />
                        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                        {statusMessage ? (
                            <Text style={[styles.messageText, styles.successText]}>{statusMessage}</Text>
                        ) : null}

                        <TouchableOpacity 
                            onPress={handleSendOtp} 
                            style={styles.sendButtonContainer}
                            disabled={isSendingOtp || (step !== 'EMAIL' && resendCooldown > 0)}
                        >
                            <LinearGradient
                                colors={['#FFD464', '#FF7E1D']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={[styles.sendButtonGradient, isSendingOtp && { opacity: 0.6 }]}
                            >
                                {isSendingOtp ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.sendButtonText}>
                                        {step === 'EMAIL'
                                            ? 'Send OTP'
                                            : resendCooldown > 0
                                                ? `Resend in ${resendCooldown}s`
                                                : 'Resend OTP'}
                                    </Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {step !== 'EMAIL' && resendCooldown > 0 && (
                            <Text style={styles.cooldownText}>
                                You can request a new OTP in {resendCooldown}s.
                            </Text>
                        )}

                        {step !== 'EMAIL' && (
                            <View style={{ width: '100%', marginTop: 25 }}>
                                <Text style={styles.inputLabel}>Email OTP</Text>
                                <TextInput
                                    style={[styles.textInput, otpError && styles.inputErrorBorder]}
                                    placeholder="Enter 6-digit code"
                                    placeholderTextColor="#a0a0a0"
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    value={otp}
                                    onChangeText={(value) => setOtp(value.replace(/[^0-9]/g, ''))}
                                    onBlur={validateOtpInput}
                                    editable={step === 'OTP' && !isVerifyingOtp}
                                />
                                {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

                                {step === 'OTP' ? (
                                    <TouchableOpacity 
                                        onPress={handleVerifyOtp}
                                        style={styles.verifyButtonContainer}
                                        disabled={isVerifyingOtp}
                                    >
                                        <LinearGradient
                                            colors={['#8BC34A', '#4CAF50']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={[styles.sendButtonGradient, isVerifyingOtp && { opacity: 0.6 }]}
                                        >
                                            {isVerifyingOtp ? (
                                                <ActivityIndicator color="#fff" size="small" />
                                            ) : (
                                                <Text style={styles.sendButtonText}>Verify OTP</Text>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.otpStatusBadge}>
                                        <MaterialIcons name="verified" size={18} color="#fff" />
                                        <Text style={styles.otpStatusText}>OTP verified</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {step === 'RESET' && (
                            <View style={{ width: '100%', marginTop: 25 }}>
                                <Text style={styles.inputLabel}>New Password</Text>
                                <TextInput
                                    style={[styles.textInput, passwordError && styles.inputErrorBorder]}
                                    placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                                    placeholderTextColor="#a0a0a0"
                                    secureTextEntry
                                    autoCapitalize="none"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    onBlur={validateNewPassword}
                                    editable={!isUpdatingPassword}
                                />

                                <Text style={styles.inputLabel}>Confirm Password</Text>
                                <TextInput
                                    style={[styles.textInput, (passwordMatchError || passwordError) && styles.inputErrorBorder]}
                                    placeholder="Re-enter new password"
                                    placeholderTextColor="#a0a0a0"
                                    secureTextEntry
                                    autoCapitalize="none"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    editable={!isUpdatingPassword}
                                />
                                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                                {passwordMatchError ? <Text style={styles.errorText}>{passwordMatchError}</Text> : null}

                                <View style={styles.criteriaContainer}>
                                    <PasswordCriteriaItem label={`At least ${MIN_PASSWORD_LENGTH} characters`} met={criteria.length} />
                                    <PasswordCriteriaItem label="Contains uppercase letter" met={criteria.uppercase} />
                                    <PasswordCriteriaItem label="Contains lowercase letter" met={criteria.lowercase} />
                                    <PasswordCriteriaItem label="Contains a number" met={criteria.number} />
                                    <PasswordCriteriaItem label="Contains a symbol" met={criteria.symbol} />
                                </View>

                                <TouchableOpacity 
                                    onPress={handlePasswordUpdate}
                                    style={styles.sendButtonContainer}
                                    disabled={isUpdatingPassword}
                                >
                                    <LinearGradient
                                        colors={['#4CAF50', '#2E7D32']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={[styles.sendButtonGradient, isUpdatingPassword && { opacity: 0.6 }]}
                                    >
                                        {isUpdatingPassword ? (
                                            <ActivityIndicator color="#fff" size="small" />
                                        ) : (
                                            <Text style={styles.sendButtonText}>Update Password</Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Back to Sign In */}
                        <TouchableOpacity 
                            onPress={() => navigation.goBack()} 
                            style={styles.backButton}
                            disabled={isBusy}
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
    cooldownText: {
        marginTop: 6,
        fontSize: 13,
        color: '#AA5A16',
        textAlign: 'center',
        fontWeight: '500',
    },
    verifyButtonContainer: {
        marginTop: 16,
        width: '100%',
    },
    otpStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#4CAF50',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 16,
    },
    otpStatusText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    criteriaContainer: {
        width: '100%',
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#FFE4CC',
        borderRadius: 16,
        padding: 14,
        backgroundColor: '#FFF9F2',
    },
    criteriaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    criteriaIcon: {
        fontSize: 16,
        width: 20,
    },
    criteriaLabel: {
        fontSize: 14,
        marginLeft: 8,
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