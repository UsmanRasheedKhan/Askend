import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
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
const OTP_LENGTH = 6;

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

const OtpVerificationScreen = ({ route, navigation }) => {
    const normalizedEmail = route?.params?.email?.trim().toLowerCase() || '';
    const initialCooldown = route?.params?.initialCooldown ?? 60;

    const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''));
    const [otpError, setOtpError] = useState('');
    const [otpSession, setOtpSession] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [resendCooldown, setResendCooldown] = useState(initialCooldown);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [isResendingOtp, setIsResendingOtp] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordMatchError, setPasswordMatchError] = useState('');
    const [criteria, setCriteria] = useState(createPasswordCriteria(''));
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const inputRefs = useRef([]);

    useEffect(() => {
        if (!normalizedEmail) {
            Alert.alert('Missing Email', 'Please start the reset flow again.', [
                {
                    text: 'Back',
                    onPress: () => navigation.replace('ForgotPasswordScreen'),
                },
            ]);
        }
    }, [normalizedEmail, navigation]);

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

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const combinedOtp = otpDigits.join('');
    const isBusy = isVerifyingOtp || isResendingOtp || isUpdatingPassword;

    const handleOtpChange = (index, value) => {
        const sanitized = value.replace(/[^0-9]/g, '');
        const nextDigits = [...otpDigits];

        if (!sanitized) {
            nextDigits[index] = '';
            setOtpDigits(nextDigits);
            return;
        }

        nextDigits[index] = sanitized.slice(-1);
        setOtpDigits(nextDigits);

        if (sanitized && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyPress = (event, index) => {
        if (event.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const validateOtpInput = () => {
        if (!combinedOtp) {
            setOtpError('Enter the 6-digit OTP from your email.');
            return false;
        }
        if (!/^\d{6}$/.test(combinedOtp)) {
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

    const handleVerifyOtp = async () => {
        if (!validateOtpInput()) {
            return;
        }

        setIsVerifyingOtp(true);
        setStatusMessage('');

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email: normalizedEmail,
                token: combinedOtp,
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
            setStatusMessage('OTP verified! Set a new password below.');
        } catch (error) {
            console.error('OTP verification failed:', error);
            Alert.alert('Invalid OTP', error.message || 'Double-check the code and try again.');
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0 || !normalizedEmail) {
            return;
        }

        setIsResendingOtp(true);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: normalizedEmail,
                options: { shouldCreateUser: false },
            });

            if (error) {
                throw error;
            }

            setOtpDigits(Array(OTP_LENGTH).fill(''));
            setOtpError('');
            setStatusMessage('New OTP sent. Check your inbox.');
            setResendCooldown(60);
            inputRefs.current[0]?.focus();
        } catch (error) {
            console.error('Error resending OTP:', error);
            Alert.alert('Could not resend OTP', error.message || 'Please try again later.');
        } finally {
            setIsResendingOtp(false);
        }
    };

    const handlePasswordUpdate = async () => {
        if (!validateNewPassword()) {
            return;
        }

        if (!otpSession?.access_token || !otpSession?.refresh_token) {
            Alert.alert('Verification Required', 'Verify the OTP before updating your password.');
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
            Alert.alert('Update Failed', error.message || 'Unable to update password.');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const renderOtpInputs = () => (
        <View style={styles.otpRow}>
            {otpDigits.map((digit, index) => (
                <TextInput
                    key={`otp-${index}`}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[styles.otpInput, otpError && styles.inputErrorBorder]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(index, value)}
                    onKeyPress={(event) => handleOtpKeyPress(event, index)}
                    editable={!isVerifyingOtp}
                    textAlign="center"
                />
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <LinearGradient
                    colors={['#FF7E1D', '#FFD464']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.backgroundGradient}
                >
                    <View style={styles.card}>
                        <LinearGradient
                            colors={['#FF7E1D', '#FFD464']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.iconCircle}
                        >
                            <MaterialIcons name="sms" size={48} color="#fff" />
                        </LinearGradient>

                        <Text style={styles.title}>Enter Verification Code</Text>
                        <Text style={styles.subtitle}>
                            We just emailed a {OTP_LENGTH}-digit code to {normalizedEmail}. Enter it below to verify your identity.
                        </Text>

                        {renderOtpInputs()}
                        {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

                        {statusMessage ? (
                            <Text style={[styles.messageText, styles.successText]}>{statusMessage}</Text>
                        ) : null}

                        <TouchableOpacity
                            onPress={handleVerifyOtp}
                            style={styles.sendButtonContainer}
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

                        <TouchableOpacity
                            style={styles.resendButton}
                            onPress={handleResendOtp}
                            disabled={resendCooldown > 0 || isResendingOtp}
                        >
                            {isResendingOtp ? (
                                <ActivityIndicator size="small" color="#FF7E1D" />
                            ) : (
                                <Text style={[styles.resendText, resendCooldown > 0 && styles.resendDisabled]}>
                                    {resendCooldown > 0
                                        ? `Resend OTP in ${resendCooldown}s`
                                        : 'Resend OTP'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        {otpSession ? (
                            <View style={styles.otpStatusBadge}>
                                <MaterialIcons name="verified" size={18} color="#fff" />
                                <Text style={styles.otpStatusText}>OTP verified</Text>
                            </View>
                        ) : null}

                        {otpSession ? (
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
                        ) : null}

                        <TouchableOpacity
                            onPress={() => navigation.replace('ForgotPasswordScreen')}
                            style={styles.backButton}
                            disabled={isBusy}
                        >
                            <MaterialIcons name="arrow-back" size={20} color="#666" />
                            <Text style={styles.backButtonText}>Use a different email</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FCF3E7',
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
        width: '90%',
        maxWidth: 420,
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 10,
    },
    iconCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
        shadowColor: '#FF7E1D',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#777',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    otpRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 8,
        marginTop: 20,
        marginBottom: 16,
    },
    otpInput: {
        width: 48,
        height: 58,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E9E3D0',
        backgroundColor: '#FDF6EC',
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginHorizontal: 4,
        shadowColor: '#FFB86C',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    textInput: {
        width: '100%',
        height: 50,
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#555',
        alignSelf: 'flex-start',
        marginBottom: 8,
        marginTop: 15,
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
    resendButton: {
        marginTop: 15,
    },
    resendText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF7E1D',
    },
    resendDisabled: {
        color: '#C79A6B',
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
        marginTop: 25,
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
    },
});

export default OtpVerificationScreen;
