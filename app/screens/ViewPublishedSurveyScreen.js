import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';

const ViewPublishedSurveyScreen = ({ navigation, route }) => {
  const surveyData = route.params?.survey || {};
  
  // ✅ Ensure data is properly extracted
  const formHeading = surveyData?.title || surveyData?.formHeading || "Untitled Survey";
  const formDescription = surveyData?.description || surveyData?.formDescription || "No description provided";
  const questions = Array.isArray(surveyData?.questions) ? surveyData.questions : [];

  // Debug
  useEffect(() => {
    console.log('ViewPublishedSurvey received data:', surveyData);
    console.log('Questions count:', questions.length);
  }, [surveyData]);

  if (!surveyData || Object.keys(surveyData).length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={50} color="#FF7800" />
        <Text style={{ fontSize: 18, color: '#666', marginTop: 20 }}>No survey data found</Text>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.goBackButton}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // --- Question Rendering Component (View Only) ---
  const renderQuestion = (question, index) => {
    if (!question) return null;
    
    const questionNumber = `Q${index + 1}`;
    const { questionType, questionText, options, isRequired, media } = question || {};

    let actualOptions = [];
    if (options) {
      if (Array.isArray(options)) {
        actualOptions = options;
      } else if (typeof options === 'object') {
        actualOptions = Object.values(options);
      }
    }
    
    if (!actualOptions || actualOptions.length === 0) {
      if (questionType === 'multiple_choice' || questionType === 'checkboxes' || questionType === 'dropdown') {
        actualOptions = ["Option 1", "Option 2", "Option 3"];
      }
    }

    const mediaNode = media ? (
      <View style={styles.mediaContainer}>
        {media.type === 'image' ? (
          <Image
            source={{ uri: media.uri }}
            style={styles.mediaImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.mediaIcon, { backgroundColor: media.iconColor || '#FFD464' }]}>
            <MaterialCommunityIcons
              name={media.iconName || 'image-outline'}
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
          <Text style={styles.questionText}>{questionText || `Question ${index + 1}`}</Text>
          {isRequired && <Text style={styles.requiredMarker}>*</Text>} 
        </View>
      </View>
    );

    let content;

    switch (questionType) {
      case 'multiple_choice':
      case 'radio_choice': 
        content = (
          <View style={styles.optionsContainer}>
            {actualOptions.map((option, optIndex) => (
              <View key={optIndex} style={[styles.optionRow, optIndex === actualOptions.length - 1 && styles.lastOptionRow]}>
                {/* ✅ EMPTY radio button - NOT selected */}
                <View style={styles.visualCircle}>
                  <View style={styles.visualCircleInner} />
                </View>
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
                {/* ✅ EMPTY checkbox - NOT checked */}
                <View style={styles.visualCheckbox} />
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
        
      case 'rating': 
        content = (
          <View style={styles.ratingContainer}>
            {/* ✅ EMPTY star rating */}
            <View style={styles.starsContainer}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(i => (
                  <MaterialCommunityIcons
                    key={i}
                    name="star-outline"
                    size={34} 
                    color="#FFD464"
                    style={{ marginHorizontal: 2 }}
                  />
                ))}
              </View>
              <View style={styles.starLabelsRow}>
                <Text style={styles.starLabelLeft}>Not likely</Text>
                <Text style={styles.starLabelRight}>Very likely</Text>
              </View>
            </View>
          </View>
        );
        break;

      case 'linear_scale': 
      case 'linear_rating': 
        content = (
          <View style={styles.ratingContainer}>
            {/* ✅ EMPTY linear scale */}
            <View style={styles.linearScaleContainer}>
              <View style={styles.linearScaleNumbers}>
                {[1, 2, 3, 4, 5].map(num => (
                  <Text 
                    key={num} 
                    style={styles.linearScaleNumber}
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

      case 'file_upload': 
      case 'picture_upload': 
        content = (
          <View style={styles.uploadContainer}>
            <MaterialIcons name="camera-alt" size={40} color="#FF7E1D" />
            <Text style={styles.uploadText}>Tap to upload a picture</Text>
          </View>
        );
        break;
        
      case 'phone': 
      case 'phone_number': 
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

      case 'email': 
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

      case 'time': 
        content = (
          <View style={styles.dateInputContainer}>
            <Text style={styles.dateText}>Select time...</Text>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#555" />
          </View>
        );
        break;

      case 'date': 
        content = (
          <View style={styles.dateInputContainer}>
            <Text style={styles.dateText}>Select date...</Text>
            <MaterialCommunityIcons name="calendar-month-outline" size={24} color="#555" />
          </View>
        );
        break;

      default:
        content = (
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackText}>
              Question type: {questionType || 'Not specified'}
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* ✅ SIMPLE Header - No preview text */}
          <View style={styles.fixedHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <MaterialIcons name="arrow-back-ios" size={24} color="#333" />
              </TouchableOpacity>

              {/* ✅ Simple title - no gradient */}
              <Text style={styles.headerTitle}>{formHeading}</Text>
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
                  {/* ✅ Simple form title - no gradient */}
                  <Text style={styles.formTitle}>{formHeading}</Text>
                  {/* Description */}
                  <Text style={styles.formDescription}>{formDescription}</Text>
                </View>
                <View style={styles.questionBadge}>
                  <Text style={styles.questionBadgeText}>{questions.length} questions</Text>
                </View>
              </View>
            </View>

            {/* Questions Cards */}
            {questions.length > 0 ? (
              questions.map((question, index) => renderQuestion(question, index))
            ) : (
              <View style={styles.noQuestionsContainer}>
                <MaterialCommunityIcons name="help-circle-outline" size={40} color="#FFD464" />
                <Text style={styles.noQuestionsText}>No questions in this survey</Text>
              </View>
            )}

            {/* ✅ NO buttons at the bottom */}
            
          </ScrollView>

          {/* ✅ NO bottom message */}
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
  // --- Simple Header ---
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
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40, 
  },

  // --- Form Header Card ---
  formHeader: {
    marginTop: 0,
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

  // --- Options (Radio/Checkbox) - EMPTY ---
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
  // ✅ EMPTY radio button
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
  visualCircleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent', // ✅ EMPTY
  },
  // ✅ EMPTY checkbox
  visualCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // ✅ EMPTY
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },

  // --- Media Styles ---
  mediaContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  mediaImage: {
    width: 200,
    height: 120,
    borderRadius: 8,
  },
  mediaIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- Long/Short Answer ---
  longTextInputContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0EDEA',
    backgroundColor: '#FBFBFB',
    paddingHorizontal: 12,
    marginTop: 8,
  },
  longAnswerHeight: {
    minHeight: 100,
    paddingVertical: 10,
  },
  shortAnswerHeight: {
    height: 48,
    justifyContent: 'center',
  },
  longTextInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    padding: 0,
  },

  // --- Input with Icon ---
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

  // --- Rating ---
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
  
  // --- Linear Rating ---
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

  // --- Date / Time / Dropdown ---
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
  
  // --- Picture Upload ---
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

  // --- Fallback Styles ---
  fallbackContainer: {
    padding: 15,
    backgroundColor: '#FFF8F1',
    borderRadius: 8,
    marginTop: 8,
  },
  fallbackText: {
    fontSize: 14,
    color: '#FF7E1D',
    fontWeight: '600',
  },

  // --- No Questions State ---
  noQuestionsContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FFF8F1',
    borderRadius: 10,
    marginTop: 20,
  },
  noQuestionsText: {
    fontSize: 16,
    color: '#FF7E1D',
    fontWeight: '600',
    marginTop: 10,
  },

  // --- Error State ---
  goBackButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FF7E1D',
    borderRadius: 8,
  },
});

export default ViewPublishedSurveyScreen;