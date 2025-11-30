import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

// --- Small visual helpers ---
const RadioVisual = ({ selected }) => (
    <View style={[styles.visualCircle, selected && styles.visualCircleSelected]}>
        {selected && <View style={styles.visualDot} />}
    </View>
);

const CheckboxVisual = ({ checked }) => (
    checked ? (
        <View style={[styles.visualCheckbox, styles.visualCheckboxChecked]}>
            <MaterialCommunityIcons name="check" size={14} color="#fff" />
        </View>
    ) : (
        <View style={styles.visualCheckbox} />
    )
);

// Star component (For Question 4) - UPDATED ✅
const StarRatingVisual = ({ maxStars = 5, initialRating = 3.5 }) => {
    const stars = [];
    const fullStars = Math.floor(initialRating);
    const hasHalfStar = initialRating - fullStars >= 0.5;

    for (let i = 1; i <= maxStars; i++) {
        let name = 'star-outline';
        let color = '#FFD464';

        if (i <= fullStars) {
            name = 'star';
        } else if (i === fullStars + 1 && hasHalfStar) {
            name = 'star-half-full';
        }

        stars.push(
            <MaterialCommunityIcons
                key={i}
                name={name}
                size={34} 
                color={color}
                style={{ marginHorizontal: 2 }}
            />
        );
    }

    return (
        <View style={styles.starsContainer}>
            <View style={styles.starsRow}>
                {stars}
            </View>
            <View style={styles.starLabelsRow}>
                <Text style={styles.starLabelLeft}>Not likely</Text>
                <Text style={styles.starLabelRight}>Very likely</Text>
            </View>
        </View>
    );
};

// Linear Scale / Slider Visual (Q6)
const LinearScaleVisual = ({ min = 1, max = 5, initialValue = 3 }) => {
    const scale = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    return (
        <View style={styles.linearScaleContainer}>
            <View style={styles.linearScaleNumbers}>
                {scale.map(num => (
                    <Text 
                        key={num} 
                        style={[
                            styles.linearScaleNumber, 
                            num === initialValue && styles.linearScaleNumberSelected
                        ]}
                    >
                        {num}
                    </Text>
                ))}
            </View>
            <View style={styles.linearScaleLabels}>
                <Text style={styles.linearScaleLabelLeft}>Strongly Dislike</Text>
                <Text style={styles.linearScaleLabelRight}>Strongly Like</Text>
            </View>
        </View>
    );
};

// --- Question Rendering Component (Dynamic) ---
const renderQuestion = (question, index) => {
    const questionNumber = `Q${index + 1}`;
    const { questionType, questionText, options, isRequired } = question;

    // Default options (if mock data is missing)
    let actualOptions = options;
    if (index === 0 && !options) actualOptions = ["Excellent", "Good", "Average", "Poor"];
    if (index === 1 && !options) actualOptions = ["Mobile App", "Website", "Customer support", "Email notifications"];
    if (index === 7 && !options) actualOptions = ["Option 1", "Option 2", "Option 3"]; 

    const mediaNode = question.media ? (
        <View style={styles.mediaContainer}>
            {question.media.type === 'image' ? (
                <Image
                    source={{ uri: question.media.uri }}
                    style={styles.mediaImage}
                    resizeMode="cover"
                />
            ) : (
                <View style={[styles.mediaIcon, { backgroundColor: question.media.iconColor || '#FFD464' }]}>
                    <MaterialCommunityIcons
                        name={question.media.iconName || 'image-outline'}
                        size={28}
                        color="#fff"
                    />
                </View>
            )}
        </View>
    ) : null;

    const header = (
        <View style={styles.questionHeader}>
            <LinearGradient
                colors={['#FF7E1D', '#FFD464']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.questionNumberCircle}
            >
                <Text style={styles.questionNumberText}>{questionNumber}</Text>
            </LinearGradient>
            <View style={styles.questionHeaderText}>
                <Text style={styles.questionText}>{questionText || `Question ${index + 1} Title`}</Text>
                {question.isRequired && <Text style={styles.requiredMarker}>*</Text>} 
            </View>
        </View>
    );

    let content;

    // ✅ FIXED: Match question types with CreateNewSurveyScreen
    switch (questionType) {
        case 'multiple_choice':
        case 'radio_choice': // ✅ Support both types
            content = (
                <View style={styles.optionsContainer}>
                    {actualOptions.map((option, optIndex) => (
                        <View key={optIndex} style={[styles.optionRow, optIndex === actualOptions.length - 1 && styles.lastOptionRow]}>
                            <RadioVisual selected={index === 0 && optIndex === 0} />
                            <Text style={styles.optionText}>{option}</Text>
                        </View>
                    ))}
                </View>
            );
            break;

        case 'checkboxes':
            content = (
                <View style={styles.optionsContainer}>
                    {actualOptions.map((option, optIndex) => (
                        <View key={optIndex} style={[styles.optionRow, optIndex === actualOptions.length - 1 && styles.lastOptionRow]}>
                            <CheckboxVisual checked={index === 1 && optIndex < 3} />
                            <Text style={styles.optionText}>{option}</Text>
                        </View>
                    ))}
                </View>
            );
            break;

        case 'long_answer': 
            content = (
                <View style={[styles.longTextInputContainer, styles.longAnswerHeight]}>
                    <TextInput
                        style={styles.longTextInput}
                        placeholder={question.placeholder || "Share your thoughts and suggestions..."} 
                        multiline={true}
                        numberOfLines={4}
                        editable={false}
                        placeholderTextColor="#999"
                        textAlignVertical="top" 
                    />
                </View>
            );
            break;

        case 'short_answer':
            content = (
                <View style={[styles.longTextInputContainer, styles.shortAnswerHeight]}>
                    <TextInput
                        style={styles.longTextInput}
                        placeholder={question.placeholder || "Type your answer here..."}
                        multiline={false} 
                        editable={false}
                        placeholderTextColor="#999"
                    />
                </View>
            );
            break;
            
        case 'rating': // ✅ Q4 - Star Rating
            content = (
                <View style={styles.ratingContainer}>
                    <StarRatingVisual initialRating={3.5} /> 
                </View>
            );
            break;

        case 'linear_scale': // ✅ Q6 - Linear Scale (FIXED NAME)
        case 'linear_rating': // ✅ Support both names
            content = (
                <View style={styles.ratingContainer}>
                    <LinearScaleVisual min={1} max={5} initialValue={3} />
                </View>
            );
            break;
            
        case 'dropdown': 
            content = (
                <View style={styles.dateInputContainer}>
                    <Text style={styles.dateText}>Select an option...</Text>
                    <MaterialIcons name="keyboard-arrow-down" size={24} color="#555" />
                </View>
            );
            break;

        case 'file_upload': // ✅ Q9 - File Upload (FIXED NAME)
        case 'picture_upload': // ✅ Support both names
            content = (
                <View style={styles.uploadContainer}>
                    <MaterialIcons name="camera-alt" size={40} color="#FF7E1D" />
                    <Text style={styles.uploadText}>Tap to upload a picture</Text>
                </View>
            );
            break;
            
        case 'phone': // ✅ Q10 - Phone Number (FIXED NAME)
        case 'phone_number': // ✅ Support both names
            content = (
                <View style={styles.iconTextInputContainer}>
                    <FontAwesome name="phone" size={20} color="#999" style={styles.inputIcon} />
                    <TextInput
                        style={styles.inputField}
                        placeholder="Enter phone number"
                        keyboardType="phone-pad"
                        editable={false}
                        placeholderTextColor="#999"
                    />
                </View>
            );
            break;

        case 'email': // ✅ Q11 - Email
            content = (
                <View style={styles.iconTextInputContainer}>
                    <MaterialIcons name="email" size={20} color="#999" style={styles.inputIcon} />
                    <TextInput
                        style={styles.inputField}
                        placeholder="Enter email address"
                        keyboardType="email-address"
                        editable={false}
                        placeholderTextColor="#999"
                    />
                </View>
            );
            break;

        case 'time': // ✅ Q12 - Time
            content = (
                <View style={styles.dateInputContainer}>
                    <Text style={styles.dateText}>10:30 AM</Text>
                    <MaterialCommunityIcons name="clock-outline" size={24} color="#555" />
                </View>
            );
            break;

        case 'date': // ✅ Q5 - Date
            content = (
                <View style={styles.dateInputContainer}>
                    <Text style={styles.dateText}>01/15/2024</Text>
                    <MaterialCommunityIcons name="calendar-month-outline" size={24} color="#555" />
                </View>
            );
            break;

        default:
            // ✅ DEBUG: Show which question type is not supported
            content = (
                <View>
                    <Text style={styles.unsupportedText}>
                        Unsupported question type: {questionType}
                    </Text>
                    <Text style={styles.debugText}>
                        Available options: {JSON.stringify(actualOptions)}
                    </Text>
                </View>
            );
            break;
    }

    return (
        <View style={styles.questionCard} key={question.id || index}>
            {header}
            {mediaNode}
            {content}
        </View>
    );
};

// --- Placeholder/Mock Data with CORRECT question types ---
const mockFormData = {
    formHeading: "Customer Experience Survey",
    formDescription: "Help us improve our service by gathering your honest experiences. Your feedback is invaluable and will help shape our future improvements.",
    isPublicForm: true,
    questions: [
        { id: 'q1', questionType: 'multiple_choice', questionText: 'How would you rate our overall service?', isRequired: false, options: ['Excellent', 'Good', 'Average', 'Poor'] },
        { id: 'q2', questionType: 'checkboxes', questionText: 'Which features do you use most? (Select all that apply)', isRequired: false, options: ['Mobile App', 'Website', 'Customer support', 'Email notifications'] },
        { id: 'q3', questionType: 'long_answer', questionText: 'What could we improve?', isRequired: false, placeholder: "Share your thoughts and suggestions..." },
        { id: 'q4', questionType: 'rating', questionText: 'How likely are you to recommend us?', isRequired: false },
        { id: 'q5', questionType: 'date', questionText: 'When did you first use our service?', isRequired: false },
        
        { id: 'q6', questionType: 'linear_scale', questionText: 'How satisfied are you with the feature?', isRequired: true, min: 1, max: 5 }, // ✅ FIXED: linear_scale
        { id: 'q7', questionType: 'short_answer', questionText: 'Most fave celeb?', isRequired: true, placeholder: "Type name here..." }, 
        { id: 'q8', questionType: 'dropdown', questionText: 'Select your preferred location.', isRequired: true, options: ["North", "South", "East", "West"] }, 
        
        // ✅ FIXED: Using correct question type names
        { id: 'q9', questionType: 'file_upload', questionText: 'Upload a picture of the product.', isRequired: false }, // ✅ FIXED: file_upload
        { id: 'q10', questionType: 'phone', questionText: 'What is your contact number?', isRequired: true }, // ✅ FIXED: phone
        { id: 'q11', questionType: 'email', questionText: 'Enter your email address.', isRequired: true }, 
        { id: 'q12', questionType: 'time', questionText: 'What time did the incident occur?', isRequired: false }, 
    ]
};

// --- MAIN PREVIEW SCREEN COMPONENT ---
const PreviewScreen = ({ navigation, route }) => {
    const formData = route.params?.formData || mockFormData;

    // ✅ DEBUG: Log the incoming data to see question types
    React.useEffect(() => {
        if (route.params?.formData) {
            console.log('Received form data:', JSON.stringify(route.params.formData, null, 2));
        }
    }, [route.params]);

    if (!formData || !formData.questions) {
        return (
            <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 18, color: '#666' }}>Error: No form data found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Go Back to Creator</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const { formHeading, formDescription, questions = [] } = formData;

    const handleEditSurvey = () => {
        Alert.alert("Edit Survey", "Returning to the creation screen for editing (Simulated).");
        navigation.goBack();
    };

    const handlePublishSurvey = () => {
        Alert.alert("Publish Survey", "Your survey is now live! (Simulated)");
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.container}>
                    {/* Fixed Top Header (The yellow bar at the top) */}
                    <View style={styles.fixedHeader}>
                        <View style={{ flexDirection: 'column' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                    <MaterialIcons name="arrow-back-ios" size={24} color="#333" />
                                </TouchableOpacity>

                                {/* Gradient text for "Survey Preview" */}
                                <MaskedView
                                    maskElement={<Text style={styles.headerTitleMask}>Survey Preview</Text>}
                                >
                                    <LinearGradient
                                        colors={['#FF7E1D', '#FFD464']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Text style={[styles.headerTitle, { opacity: 0 }]}>Survey Preview</Text>
                                    </LinearGradient>
                                </MaskedView>
                            </View>

                            <Text style={styles.headerSubtitle}>Here's how your survey will appear to users.</Text>
                        </View>

                        <View style={styles.headerStatus}>
                            <View style={styles.greenDot} />
                        </View>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false} 
                    >
                        {/* Form Header Card */}
                        <View style={styles.formHeader}>
                            <View style={styles.formHeaderInner}>
                                <View style={styles.formIconBox}>
                                    <MaterialCommunityIcons name="clipboard-text-outline" size={28} color="#fff" />
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    {/* --- Form Title with Gradient --- */}
                                    <MaskedView
                                        maskElement={<Text style={styles.formTitleMask}>{formHeading || "Survey Heading"}</Text>}
                                    >
                                        <LinearGradient
                                            colors={['#374151', '#693B32', '#92400E']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        >
                                            <Text style={[styles.formTitle, { opacity: 0 }]}>{formHeading || "Survey Heading"}</Text>
                                        </LinearGradient>
                                    </MaskedView>
                                    {/* ------------------------------------------- */}
                                    <Text style={styles.formDescription}>{formDescription || "Survey Description..."}</Text>
                                </View>
                                <View style={styles.questionBadge}>
                                    <Text style={styles.questionBadgeText}>{questions.length} questions</Text>
                                </View>
                            </View>
                        </View>

                        {/* Questions Cards */}
                        {questions.map((q, i) => renderQuestion(q, i))}

                    </ScrollView>

                    {/* Preview Actions (The fixed bottom buttons) */}
                    <View style={styles.previewActions}>
                        <TouchableOpacity style={styles.editButton} onPress={handleEditSurvey}>
                            <MaterialIcons name="edit" size={18} color="#FF7E1D" />
                            <Text style={styles.editButtonText}> Edit Survey</Text>
                        </TouchableOpacity>

                        <LinearGradient
                             colors={['#FFD464', '#FF7E1D']} 
                             start={{ x: 0, y: 0 }}
                             end={{ x: 1, y: 0 }}
                             style={styles.publishButtonGradient}
                        >
                            <TouchableOpacity style={styles.publishButton} onPress={handlePublishSurvey}>
                                <Text style={styles.publishButtonText}>Publish</Text>
                                <MaterialIcons name="send" size={18} color="#fff" style={{ marginLeft: 8 }} />
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>

                    {/* The message now sits below the fixed button container */}
                    <View style={styles.bottomMessageContainer}>
                        <Text style={styles.publishSuccessMessage}>
                            Ready to go live! Your survey looks amazing!
                        </Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF', 
    },
    container: {
        flex: 1,
    },
    // --- Fixed Top Header (The yellow bar) ---
    fixedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#FFF8F1', 
        borderBottomWidth: 1,
        borderBottomColor: '#F0EDEA',
        paddingBottom: 20,
    },
    backButton: {
        padding: 6,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginLeft: 6,
        marginTop: 4,
        paddingBottom: 2,
    },
    headerTitleMask: {
        fontSize: 20,
        fontWeight: '700',
        color: 'black', 
        paddingTop: 5,
        marginLeft: 6,
        backgroundColor: 'transparent',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
        marginLeft: 42, 
        fontWeight: '500',
    },
    headerStatus: {
        width: 28,
        alignItems: 'flex-end',
        marginTop: -10,
    },
    greenDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#8EE07C',
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 160, 
    },

    // --- Form Header Card ---
    formHeader: {
        marginTop: 30,
        marginBottom: 16,
        
    },
    formHeaderInner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 8, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 1,
        borderLeftWidth: 0.001, 
        borderLeftColor: '#000',
        backgroundColor: '#FFF8F1',
        borderColor: '#000',
        borderWidth: 0.001,
        
    },
    formIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#FF7E1D',
        justifyContent: 'center',
        alignItems: 'center',
    },
    formTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#222', 
    },
    formTitleMask: {
        fontSize: 18,
        fontWeight: '800',
        color: 'black', 
        backgroundColor: 'transparent',
    },
    formDescription: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
        lineHeight: 18,
    },
    questionBadge: {
        position: 'absolute',
        top: -15,
        right: 0,
        backgroundColor: '#FFF7EE',
        borderRadius: 16,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#FFDCA8',
        shadowColor: '#FF7E1D',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 1,
    },
    questionBadgeText: {
        color: '#FF7E1D',
        fontWeight: '700',
        fontSize: 12,
    },

    // --- Question Card Styles ---
    questionCard: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 18,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
        borderTopWidth: 0, 
        borderColor: '#F0EDEA', 
        borderWidth: 1, 
    },
    questionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    questionNumberCircle: {
        width: 36,
        height: 36,
        borderRadius: 8, 
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    questionNumberText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 16,
    },
    questionHeaderText: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    questionText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#222',
        marginRight: 4,
    },
    requiredMarker: {
        color: '#FF6B6B',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: -2,
    },

    // --- Options (Radio/Checkbox) ---
    optionsContainer: {
        marginTop: 4,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 4,
    },
    lastOptionRow: {
        marginBottom: 0,
    },
    visualCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    visualCircleSelected: {
        borderColor: '#FF7E1D',
    },
    visualDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FF7E1D',
    },
    visualCheckbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    visualCheckboxChecked: {
        backgroundColor: '#FF7E1D',
        borderColor: '#FF7E1D',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },

    // --- Long/Short Answer (Q3, Q7) ---
    longTextInputContainer: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F0EDEA',
        backgroundColor: '#FBFBFB',
        paddingHorizontal: 12, // Use horizontal padding for consistency
        marginTop: 8,
    },
    // Style for Long Answer (multi-line)
    longAnswerHeight: {
        minHeight: 100,
        paddingVertical: 10,
    },
    // Style for Short Answer (single line)
    shortAnswerHeight: {
        height: 48, 
        justifyContent: 'center', 
    },
    longTextInput: {
        flex: 1, // Take up available space in container
        fontSize: 15,
        color: '#333',
        padding: 0,
    },

    // --- Input with Icon (Phone, Email) ---
    iconTextInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0EDEA',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 48,
        backgroundColor: '#FBFBFB',
        marginTop: 8,
    },
    inputIcon: {
        marginRight: 10,
    },
    inputField: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 0,
    },

    // --- Rating (Q4) - UPDATED STYLES ✅ ---
    ratingContainer: {
        marginTop: 10,
    },
    starsContainer: {
        backgroundColor: '#FBFBFB',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#F0EDEA',
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginTop: 8,
    },
    starsRow: {
        flexDirection: 'row',
        justifyContent: 'center', 
        alignItems: 'center',
        marginBottom: 8,
    },
    starLabelsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    starLabelLeft: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    starLabelRight: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    
    // --- Linear Rating (Q6) ---
    linearScaleContainer: {
        backgroundColor: '#FBFBFB',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#F0EDEA',
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginTop: 8,
    },
    linearScaleNumbers: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    linearScaleNumber: {
        width: 30,
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    linearScaleNumberSelected: {
        color: '#FF7E1D',
        fontWeight: '700',
    },
    linearScaleLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
    },
    linearScaleLabelLeft: {
        fontSize: 12,
        color: '#999',
    },
    linearScaleLabelRight: {
        fontSize: 12,
        color: '#999',
    },

    // --- Date / Time / Dropdown (Q5, Q8, Q12) ---
    dateInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0EDEA',
        borderRadius: 10,
        padding: 12,
        backgroundColor: '#FBFBFB',
        marginTop: 8,
        height: 48,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    
    // --- Picture Upload (Q9) ---
    uploadContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 120,
        borderWidth: 2,
        borderColor: '#FFDCA8',
        borderRadius: 10,
        borderStyle: 'dashed',
        backgroundColor: '#FFF8F1',
        marginTop: 8,
    },
    uploadText: {
        marginTop: 8,
        fontSize: 14,
        color: '#FF7E1D',
        fontWeight: '600',
    },

    // --- Fixed Bottom Action Bar ---
    previewActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#fff', 
        borderTopWidth: 0,
        position: 'absolute',
        bottom: 40, 
        left: 0,
        right: 0,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 30, 
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFDCA8',
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    editButtonText: {
        color: '#FF7E1D',
        fontWeight: '700',
        fontSize: 16,
        marginLeft: 6,
    },
    publishButtonGradient: {
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    publishButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 12,
    },
    publishButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },

    // --- Final Message Container ---
    bottomMessageContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: 4,
        paddingBottom: 15,
        backgroundColor: '#fff', 
    },
    publishSuccessMessage: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
    },

    // Fallback/Error styles
    goBackButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#FF7E1D',
        borderRadius: 8,
    },
    unsupportedText: { 
        color: '#FF6B6B',
        fontSize: 16,
        marginTop: 8,
        fontWeight: '600',
    },
    debugText: {
        color: '#999',
        fontSize: 12,
        marginTop: 4,
        fontStyle: 'italic',
    }
});

export default PreviewScreen;