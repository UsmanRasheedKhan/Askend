import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Switch, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// --- Survey Categories Data ---
const surveyCategories = [
    "Customer Feedback",
    "Market Research",
    "Employee Satisfaction",
    "Product Feedback",
    "Academic Research",
    "Event Feedback",
    "Healthcare Survey",
    "User Experience",
    "Brand Awareness",
    "Social Research"
];

// --- Question Types Data ---
const questionTypes = [
    {
        id: 'multiple_choice',
        name: 'Multiple Choice',
        icon: 'radiobox-marked',
        description: 'User selects one option from multiple choices'
    },
    {
        id: 'checkboxes',
        name: 'Checkboxes',
        icon: 'checkbox-multiple-marked',
        description: 'User can select multiple options'
    },
    {
        id: 'short_answer',
        name: 'Short Answer',
        icon: 'text-short',
        description: 'User enters short text response'
    },
    {
        id: 'long_answer',
        name: 'Long Answer',
        icon: 'text-long',
        description: 'User enters detailed text response'
    },
    {
        id: 'dropdown',
        name: 'Dropdown',
        icon: 'menu-down',
        description: 'User selects from a dropdown list'
    },
    {
        id: 'linear_scale',
        name: 'Linear Scale',
        icon: 'format-list-numbered',
        description: 'User rates on a scale (e.g., 1-5)'
    },
    {
        id: 'rating',
        name: 'Star Rating',
        icon: 'star',
        description: 'User gives star rating'
    },
    {
        id: 'date',
        name: 'Date',
        icon: 'calendar',
        description: 'User selects a date'
    },
    {
        id: 'time',
        name: 'Time',
        icon: 'clock',
        description: 'User selects a time'
    },
    {
        id: 'file_upload',
        name: 'File Upload',
        icon: 'file-upload',
        description: 'User uploads a file'
    },
    {
        id: 'email',
        name: 'Email',
        icon: 'email',
        description: 'User enters email address'
    },
    {
        id: 'phone',
        name: 'Phone Number',
        icon: 'phone',
        description: 'User enters phone number'
    }
];

// --- Demographic Data ---
const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];
const ageOptions = [
    "18-24", "25-34", "35-44", "45-54", "55-64", "65+"
];
const maritalStatusOptions = ["Single", "Married", "Divorced", "Widowed", "Separated"];
const educationOptions = [
    'Matric/O-Levels', 
    'Intermediate/A-Levels', 
    'Bachelors', 
    'Masters', 
    'PhD'
];

// Pakistan Cities (Complete list)
const pakistanCities = [
    "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", 
    "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala",
    "Hyderabad", "Sukkur", "Abbottabad", "Bahawalpur", "Sargodha",
    "Mardan", "Mingora", "Larkana", "Sheikhupura", "Rahim Yar Khan",
    "Jhang", "Sahiwal", "Wah Cantonment", "Gujrat", "Okara",
    "Mirpur Khas", "Kasur", "Nawabshah", "Chiniot", "Kamoke",
    "Hafizabad", "Sadiqabad", "Burewala", "Kohat", "Khanewal",
    "Dera Ghazi Khan", "Turbat", "Muzaffargarh", "Abbottabad",
    "Mandi Bahauddin", "Shikarpur", "Jacobabad", "Jhelum", "Khuzdar",
    "Pakpattan", "Kharian", "Mianwali", "Chishtian", "Gojra",
    "Muridke", "Bahawalnagar", "Samundri", "Jaranwala", "Chakwal",
    "Khushab", "Ghotki", "Kamber", "Matiari", "Thatta"
];

// Profession Options (Expanded list)
const professionOptions = [
    "Student", "Teacher", "Professor", "Engineer", "Software Developer", 
    "Doctor", "Nurse", "Medical Professional", "Business Owner", "Entrepreneur",
    "Accountant", "CA", "Marketing Manager", "Sales Executive", "HR Manager",
    "Banker", "Finance Manager", "Investment Advisor", "Architect", "Designer",
    "Lawyer", "Advocate", "Journalist", "Writer", "Content Creator",
    "Government Employee", "Civil Servant", "Police Officer", "Army Officer",
    "Pilot", "Air Hostess", "Hotel Manager", "Chef", "Restaurant Owner",
    "Farmer", "Agricultural Expert", "Real Estate Agent", "Property Dealer",
    "Consultant", "Freelancer", "Contractor", "Electrician", "Plumber",
    "Mechanic", "Driver", "Shopkeeper", "Salesman", "Factory Worker",
    "Laborer", "Housewife", "Retired", "Unemployed", "Other"
];

// Salary Range Options (in K format)
const salaryOptions = [
    "0-25K", "26K-50K", "51K-75K", "76K-100K", 
    "101K-150K", "151K-200K", "201K-300K", "301K-500K", "500K+"
];

// Interest and Hobbies Data with Categories and Subcategories
const INTEREST_DATA = [
    {
        id: 'sports',
        name: 'Sports',
        subCategories: ['Cricket', 'Football/Soccer', 'Basketball', 'Tennis', 'Running/Marathon', 'Gym/Weight Training', 'Yoga/Pilates', 'Other Sports'],
    },
    {
        id: 'reading',
        name: 'Reading',
        subCategories: ['Fiction', 'Non-Fiction', 'Biography', 'Self-Help', 'Poetry', 'Magazines/News'],
    },
    {
        id: 'art',
        name: 'Arts & Culture',
        subCategories: [
            'Painting/Drawing',
            'Sculpting',
            'Photography',
            'Graphic Design',
            'Crafting',
            'Music (Instrumental)',
            'Rapping',
            'Beatboxing',
            'Singing/Vocal',
            'Dancing/Choreography',
            'Acting/Theatre'
        ],
    },
    {
        id: 'travel',
        name: 'Travelling',
        subCategories: ['Adventure Travel', 'Cultural Trips', 'Road Trips', 'Local Sightseeing', 'Backpacking'],
    },
    {
        id: 'fitness',
        name: 'Fitness',
        subCategories: ['Aerobics', 'Cardio', 'Weightlifting', 'Hiking', 'Martial Arts'],
    },
    {
        id: 'digital',
        name: 'Digital',
        subCategories: ['Gaming', 'Coding/Programming', 'Social Media', 'Content Creation', 'Tech Gadgets'],
    },
    {
        id: 'gardening',
        name: 'Gardening',
        subCategories: ['Indoor Plants', 'Vegetable Gardening', 'Landscape Design', 'Bonsai'],
    },
    {
        id: 'food',
        name: 'Food',
        subCategories: ['Cooking', 'Baking', 'Fine Dining', 'Street Food', 'Food Reviewing'],
    },
    {
        id: 'streaming',
        name: 'Streaming & TV',
        subCategories: ['Netflix/HBO/Hulu', 'YouTube (Long-form)', 'TikTok/Reels (Short-form)', 'Gaming Streams (Twitch)', 'Sports Broadcasts', 'Documentaries/News'],
    },
    {
        id: 'finance',
        name: 'Finance & Investing',
        subCategories: ['Stock Market/Trading', 'Personal Budgeting', 'Cryptocurrency/NFTs', 'Real Estate', 'Entrepreneurship', 'Side Hustles'],
    },
    {
        id: 'fashion',
        name: 'Fashion & Style',
        subCategories: ['Streetwear', 'Luxury & High-End Brands', 'Sustainable Fashion', 'Thrift/Vintage Shopping', 'Style & Grooming Tips', 'Cosmetics & Skincare'],
    },
    {
        id: 'automotive',
        name: 'Automotive',
        subCategories: ['Cars/Bikes Reviews', 'Car Modifications/DIY', 'Racing & Motorsport', 'Vintage & Classic Cars', 'Electric Vehicles (EVs)', 'Auto Repair/Maintenance'],
    },
];

// --- MAIN SCREEN COMPONENT ---
const CreateNewSurveyScreen = ({ navigation }) => {
    const [isPublicForm, setIsPublicForm] = useState(false);
    const [isRequiredQuestion, setIsRequiredQuestion] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    
    // Demographic dropdown states
    const [selectedGender, setSelectedGender] = useState(null);
    const [showGenderDropdown, setShowGenderDropdown] = useState(false);
    
    const [selectedAge, setSelectedAge] = useState(null);
    const [showAgeDropdown, setShowAgeDropdown] = useState(false);
    
    const [selectedMaritalStatus, setSelectedMaritalStatus] = useState(null);
    const [showMaritalStatusDropdown, setShowMaritalStatusDropdown] = useState(false);
    
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    
    const [selectedEducation, setSelectedEducation] = useState(null);
    const [showEducationDropdown, setShowEducationDropdown] = useState(false);
    
    const [selectedProfession, setSelectedProfession] = useState(null);
    const [showProfessionDropdown, setShowProfessionDropdown] = useState(false);
    
    const [selectedSalary, setSelectedSalary] = useState(null);
    const [showSalaryDropdown, setShowSalaryDropdown] = useState(false);
    
    // Interest & Hobbies states
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [showInterestsDropdown, setShowInterestsDropdown] = useState(false);
    const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
    const [selectedMainCategory, setSelectedMainCategory] = useState(null);

    // Question Builder states
    // IMPORTANT CHANGE: initial option values are empty strings so they act as placeholders.
    const [questions, setQuestions] = useState([
        {
            id: 1,
            questionText: '',
            questionType: 'multiple_choice',
            options: ['', '', ''], // empty values so TextInput shows placeholder "Option 1" etc.
            isRequired: true
        }
    ]);
    const [showQuestionTypeDropdown, setShowQuestionTypeDropdown] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setShowCategoryDropdown(false);
    };

    // Close all other dropdowns when opening one
    const closeAllDropdowns = () => {
        setShowCategoryDropdown(false);
        setShowGenderDropdown(false);
        setShowAgeDropdown(false);
        setShowMaritalStatusDropdown(false);
        setShowLocationDropdown(false);
        setShowEducationDropdown(false);
        setShowProfessionDropdown(false);
        setShowSalaryDropdown(false);
        setShowInterestsDropdown(false);
        setShowQuestionTypeDropdown(false);
    };

    // Generic dropdown handler
    const createDropdownHandler = (setSelected, setShowDropdown) => (value) => {
        setSelected(value);
        setShowDropdown(false);
    };

    // Generic dropdown component
    const renderDropdown = (options, selectedValue, showDropdown, setShowDropdown, onSelect, placeholder, disabled = false) => (
        <View style={styles.dropdownContainer}>
            <TouchableOpacity 
                style={[
                    styles.dropdownInput,
                    disabled && styles.disabledDropdown
                ]}
                onPress={() => {
                    if (disabled) return;
                    closeAllDropdowns();
                    setShowDropdown(!showDropdown);
                }}
                disabled={disabled}
            >
                <Text style={[
                    selectedValue ? styles.dropdownSelected : styles.dropdownPlaceholder,
                    disabled && styles.disabledText
                ]}>
                    {selectedValue || placeholder}
                </Text>
                <MaterialIcons 
                    name={showDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                    size={24} 
                    color={disabled ? "#ccc" : "#aaa"} 
                />
            </TouchableOpacity>

            {showDropdown && !disabled && (
                <View style={styles.dropdownOptions}>
                    <ScrollView 
                        style={styles.dropdownScrollView}
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                    >
                        {options.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.dropdownOption,
                                    selectedValue === option && styles.selectedDropdownOption
                                ]}
                                onPress={() => onSelect(option)}
                            >
                                <Text
                                    style={[
                                        styles.dropdownOptionText,
                                        selectedValue === option && styles.selectedDropdownOptionText
                                    ]}
                                >
                                    {option}
                                </Text>
                                {selectedValue === option && (
                                    <MaterialIcons name="check" size={20} color="#FF7800" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );

    // Question Type Dropdown Component
    const renderQuestionTypeDropdown = () => {
        const currentQuestion = questions[currentQuestionIndex];
        const selectedQuestionType = questionTypes.find(qt => qt.id === currentQuestion.questionType);

        return (
            <View style={styles.dropdownContainer}>
                <TouchableOpacity 
                    style={styles.questionTypeDropdown}
                    onPress={() => {
                        closeAllDropdowns();
                        setShowQuestionTypeDropdown(!showQuestionTypeDropdown);
                    }}
                >
                    <MaterialCommunityIcons 
                        name={selectedQuestionType?.icon} 
                        size={20} 
                        color="#FF7800" 
                    />
                    <Text style={styles.questionTypeDropdownText}>
                        {selectedQuestionType?.name}
                    </Text>
                    <MaterialIcons 
                        name={showQuestionTypeDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                        size={24} 
                        color="#aaa" 
                    />
                </TouchableOpacity>

                {showQuestionTypeDropdown && (
                    <View style={[styles.dropdownOptions, styles.questionTypeOptions]}>
                        <ScrollView 
                            style={styles.dropdownScrollView}
                            nestedScrollEnabled={true}
                            showsVerticalScrollIndicator={true}
                        >
                            {questionTypes.map((questionType, index) => (
                                <TouchableOpacity
                                    key={questionType.id}
                                    style={[
                                        styles.questionTypeOption,
                                        currentQuestion.questionType === questionType.id && styles.selectedQuestionTypeOption
                                    ]}
                                    onPress={() => {
                                        const updatedQuestions = [...questions];
                                        updatedQuestions[currentQuestionIndex] = {
                                            ...updatedQuestions[currentQuestionIndex],
                                            questionType: questionType.id
                                        };
                                        setQuestions(updatedQuestions);
                                        setShowQuestionTypeDropdown(false);
                                    }}
                                >
                                    <MaterialCommunityIcons 
                                        name={questionType.icon} 
                                        size={20} 
                                        color={currentQuestion.questionType === questionType.id ? "#FF7800" : "#666"} 
                                        style={styles.questionTypeIcon}
                                    />
                                    <View style={styles.questionTypeInfo}>
                                        <Text style={[
                                            styles.questionTypeName,
                                            currentQuestion.questionType === questionType.id && styles.selectedQuestionTypeName
                                        ]}>
                                            {questionType.name}
                                        </Text>
                                        <Text style={styles.questionTypeDescription}>
                                            {questionType.description}
                                        </Text>
                                    </View>
                                    {currentQuestion.questionType === questionType.id && (
                                        <MaterialIcons name="check" size={20} color="#FF7800" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>
        );
    };

    // Question Handlers
    const updateQuestionText = (text) => {
        const updatedQuestions = [...questions];
        updatedQuestions[currentQuestionIndex] = {
            ...updatedQuestions[currentQuestionIndex],
            questionText: text
        };
        setQuestions(updatedQuestions);
    };

    const updateOptionText = (optionIndex, text) => {
        const updatedQuestions = [...questions];
        const updatedOptions = [...updatedQuestions[currentQuestionIndex].options];
        updatedOptions[optionIndex] = text;
        updatedQuestions[currentQuestionIndex] = {
            ...updatedQuestions[currentQuestionIndex],
            options: updatedOptions
        };
        setQuestions(updatedQuestions);
    };

    const addNewOption = () => {
        const updatedQuestions = [...questions];
        const updatedOptions = [...updatedQuestions[currentQuestionIndex].options];
        // push empty string so placeholder shows and user doesn't have to erase
        updatedOptions.push('');
        updatedQuestions[currentQuestionIndex] = {
            ...updatedQuestions[currentQuestionIndex],
            options: updatedOptions
        };
        setQuestions(updatedQuestions);
    };

    const removeOption = (optionIndex) => {
        const updatedQuestions = [...questions];
        const updatedOptions = [...updatedQuestions[currentQuestionIndex].options];
        if (updatedOptions.length > 1) {
            updatedOptions.splice(optionIndex, 1);
            updatedQuestions[currentQuestionIndex] = {
                ...updatedQuestions[currentQuestionIndex],
                options: updatedOptions
            };
            setQuestions(updatedQuestions);
        }
    };

    const addNewQuestion = () => {
        const newQuestion = {
            id: questions.length + 1,
            questionText: '',
            questionType: 'multiple_choice',
            options: ['', '', ''], // empty placeholders
            isRequired: true
        };
        setQuestions([...questions, newQuestion]);
        setCurrentQuestionIndex(questions.length);
    };

    const toggleQuestionRequired = () => {
        const updatedQuestions = [...questions];
        updatedQuestions[currentQuestionIndex] = {
            ...updatedQuestions[currentQuestionIndex],
            isRequired: !updatedQuestions[currentQuestionIndex].isRequired
        };
        setQuestions(updatedQuestions);
        setIsRequiredQuestion(!isRequiredQuestion);
    };

    // NEW: delete question handler
    const removeQuestion = (indexToRemove) => {
        // indexToRemove refers to position in array
        if (questions.length === 1) {
            // If only one question exists, reset it to default empty question instead of removing entirely
            const resetQuestion = {
                id: 1,
                questionText: '',
                questionType: 'multiple_choice',
                options: ['', '', ''],
                isRequired: true
            };
            setQuestions([resetQuestion]);
            setCurrentQuestionIndex(0);
            return;
        }

        const updated = questions.filter((_, idx) => idx !== indexToRemove);
        // Re-assign sequential ids
        const reId = updated.map((q, idx) => ({ ...q, id: idx + 1 }));
        setQuestions(reId);

        // Update currentQuestionIndex safely
        if (indexToRemove === currentQuestionIndex) {
            // Move to previous question if possible, otherwise stay at 0
            const newIndex = Math.max(0, currentQuestionIndex - 1);
            setCurrentQuestionIndex(newIndex);
        } else if (indexToRemove < currentQuestionIndex) {
            // If removed an earlier question, shift current index back by 1
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        } else {
            // removed an after-index, currentQuestionIndex stays the same
            setCurrentQuestionIndex(currentQuestionIndex);
        }
    };

    // Interest & Hobbies handlers
    const handleMainCategorySelect = (category) => {
        if (isPublicForm) return;
        setSelectedMainCategory(category);
        setShowInterestsDropdown(false);
        setShowSubCategoryModal(true);
    };

    const handleSubCategorySelect = (subCategory) => {
        const interestString = `${selectedMainCategory.name} - ${subCategory}`;
        
        setSelectedInterests(prev => {
            // Check if already exists
            if (prev.includes(interestString)) {
                return prev.filter(item => item !== interestString);
            }
            return [...prev, interestString];
        });
    };

    const isSubCategorySelected = (subCategory) => {
        const interestString = `${selectedMainCategory.name} - ${subCategory}`;
        return selectedInterests.includes(interestString);
    };

    const removeInterest = (interest) => {
        if (isPublicForm) return;
        setSelectedInterests(prev => prev.filter(item => item !== interest));
    };

    const getSelectedInterestsDisplay = () => {
        if (selectedInterests.length === 0) return "Any";
        if (selectedInterests.length === 1) return selectedInterests[0];
        return `${selectedInterests.length} interests selected`;
    };

    // Option letter colors to visually match the screenshot
    const optionBadgeColors = ['#00A0FF', '#33C37D', '#8B4DFF', '#FF94B0', '#FFB84D', '#7FB3FF'];

    return (
        <View style={styles.container}>
            
            {/* Back Button - Still Fixed */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={28} color="#444" />
            </TouchableOpacity>

            {/* Main Scrollable Content */}
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                {/* HEADER CONTENT */}
                <View style={styles.header}>
                    <View style={styles.largeIconContainer}>
                        <MaterialCommunityIcons name="clipboard-text-outline" size={50} color="#fff" />
                    </View>
                    <Text style={styles.mainHeading}>Create New Survey</Text>
                    <Text style={styles.descriptionText}>
                        Build powerful, beautiful forms that engage your audience and collect meaningful data with our advanced form builder.
                    </Text>
                </View>

                {/* --- BASIC INFORMATION SECTION --- */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeaderContainer}>
                        <MaterialCommunityIcons name="information" size={24} color="#FF7800" />
                        <View style={styles.sectionHeaderText}>
                            <Text style={styles.sectionTitle}>Basic Information</Text>
                            <Text style={styles.sectionSubtitle}>Set the foundation of your form</Text>
                        </View>
                    </View>

                    {/* Form Heading */}
                    <Text style={styles.inputLabel}>Form Heading</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter form title"
                        placeholderTextColor="#aaa"
                    />

                    {/* Form Description */}
                    <Text style={styles.inputLabel}>Form Description</Text>
                    <TextInput
                        style={[styles.textInput, styles.multilineInput]}
                        placeholder="Describe the purpose of this form"
                        placeholderTextColor="#aaa"
                        multiline
                        numberOfLines={4}
                    />
                    
                    {/* Select Category */}
                    <Text style={styles.inputLabel}>Category</Text>
                    {renderDropdown(
                        surveyCategories,
                        selectedCategory,
                        showCategoryDropdown,
                        setShowCategoryDropdown,
                        handleCategorySelect,
                        "Select Category"
                    )}

                    {/* Form Visibility & Filters */}
                    <Text style={styles.inputLabel}>Form Visibility & Filters</Text>
                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Public Form</Text>
                        <Text style={styles.switchDescription}>Accessible to everyone</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#FFD464" }}
                            thumbColor={isPublicForm ? "#FF7800" : "#f4f3f4"}
                            onValueChange={setIsPublicForm}
                            value={isPublicForm}
                        />
                    </View>

                    {/* Demographic Filters Section (Nested Card) */}
                    <View style={[
                        styles.nestedCard,
                        isPublicForm && styles.lockedSection
                    ]}>
                        <View style={styles.sectionHeaderContainer}>
                            <MaterialCommunityIcons name="account-filter" size={24} color="#FF7800" />
                            <View style={styles.sectionHeaderText}>
                                <Text style={styles.sectionTitle}>Demographic Filters</Text>
                                <Text style={styles.sectionSubtitle}>Narrowing form's reach by demographics</Text>
                            </View>
                            {isPublicForm && (
                                <View style={styles.lockBadge}>
                                    <MaterialIcons name="lock" size={16} color="#fff" />
                                    <Text style={styles.lockText}>Locked</Text>
                                </View>
                            )}
                        </View>

                        {isPublicForm ? (
                            <View style={styles.lockedMessageContainer}>
                                <MaterialIcons name="info-outline" size={24} color="#FF7800" />
                                <Text style={styles.lockedMessage}>
                                    Demographic filters are disabled for public forms. This form will be accessible to everyone.
                                </Text>
                            </View>
                        ) : (
                            <>
                                {/* 🛑 UPDATED FILTER ROWS WITH DROPDOWNS 🛑 */}
                                
                                {/* Row 1: Gender & Age Range */}
                                <View style={styles.filterRow}>
                                    <View style={styles.filterInputGroup}>
                                        <Text style={styles.filterLabel}>Gender</Text>
                                        {renderDropdown(
                                            genderOptions,
                                            selectedGender,
                                            showGenderDropdown,
                                            setShowGenderDropdown,
                                            createDropdownHandler(setSelectedGender, setShowGenderDropdown),
                                            "Any"
                                        )}
                                    </View>
                                    <View style={styles.filterInputGroup}>
                                        <Text style={styles.filterLabel}>Age Range</Text>
                                        {renderDropdown(
                                            ageOptions,
                                            selectedAge,
                                            showAgeDropdown,
                                            setShowAgeDropdown,
                                            createDropdownHandler(setSelectedAge, setShowAgeDropdown),
                                            "Any"
                                        )}
                                    </View>
                                </View>
                                
                                {/* Row 2: Marital Status & Location */}
                                <View style={styles.filterRow}>
                                    <View style={styles.filterInputGroup}>
                                        <Text style={styles.filterLabel}>Marital Status</Text>
                                        {renderDropdown(
                                            maritalStatusOptions,
                                            selectedMaritalStatus,
                                            showMaritalStatusDropdown,
                                            setShowMaritalStatusDropdown,
                                            createDropdownHandler(setSelectedMaritalStatus, setShowMaritalStatusDropdown),
                                            "Any"
                                        )}
                                    </View>
                                    <View style={styles.filterInputGroup}>
                                        <Text style={styles.filterLabel}>Location</Text>
                                        {renderDropdown(
                                            pakistanCities,
                                            selectedLocation,
                                            showLocationDropdown,
                                            setShowLocationDropdown,
                                            createDropdownHandler(setSelectedLocation, setShowLocationDropdown),
                                            "Any"
                                        )}
                                    </View>
                                </View>
                                
                                {/* Row 3: Education & Profession */}
                                <View style={styles.filterRow}>
                                    <View style={styles.filterInputGroup}>
                                        <Text style={styles.filterLabel}>Education</Text>
                                        {renderDropdown(
                                            educationOptions,
                                            selectedEducation,
                                            showEducationDropdown,
                                            setShowEducationDropdown,
                                            createDropdownHandler(setSelectedEducation, setShowEducationDropdown),
                                            "Any"
                                        )}
                                    </View>
                                    <View style={styles.filterInputGroup}>
                                        <Text style={styles.filterLabel}>Profession</Text>
                                        {renderDropdown(
                                            professionOptions,
                                            selectedProfession,
                                            showProfessionDropdown,
                                            setShowProfessionDropdown,
                                            createDropdownHandler(setSelectedProfession, setShowProfessionDropdown),
                                            "Any"
                                        )}
                                    </View>
                                </View>
                                
                                {/* Row 4: Salary Range & Interest & Hobbies */}
                                <View style={styles.filterRow}>
                                    <View style={styles.filterInputGroup}>
                                        <Text style={styles.filterLabel}>Salary Range</Text>
                                        {renderDropdown(
                                            salaryOptions,
                                            selectedSalary,
                                            showSalaryDropdown,
                                            setShowSalaryDropdown,
                                            createDropdownHandler(setSelectedSalary, setShowSalaryDropdown),
                                            "Any"
                                        )}
                                    </View>
                                    <View style={styles.filterInputGroup}>
                                        <Text style={styles.filterLabel}>Interest & Hobbies</Text>
                                        <View style={styles.dropdownContainer}>
                                            <TouchableOpacity 
                                                style={styles.dropdownInput}
                                                onPress={() => {
                                                    closeAllDropdowns();
                                                    setShowInterestsDropdown(!showInterestsDropdown);
                                                }}
                                            >
                                                <Text style={selectedInterests.length > 0 ? styles.dropdownSelected : styles.dropdownPlaceholder}>
                                                    {getSelectedInterestsDisplay()}
                                                </Text>
                                                <MaterialIcons 
                                                    name={showInterestsDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                                                    size={24} 
                                                    color="#aaa" 
                                                />
                                            </TouchableOpacity>

                                            {showInterestsDropdown && (
                                                <View style={styles.dropdownOptions}>
                                                    <ScrollView 
                                                        style={styles.dropdownScrollView}
                                                        nestedScrollEnabled={true}
                                                        showsVerticalScrollIndicator={true}
                                                    >
                                                        {INTEREST_DATA.map((category, index) => (
                                                            <TouchableOpacity
                                                                key={category.id}
                                                                style={styles.dropdownOption}
                                                                onPress={() => handleMainCategorySelect(category)}
                                                            >
                                                                <Text style={styles.dropdownOptionText}>
                                                                    {category.name}
                                                                </Text>
                                                                <MaterialIcons name="chevron-right" size={20} color="#aaa" />
                                                            </TouchableOpacity>
                                                        ))}
                                                    </ScrollView>
                                                </View>
                                            )}
                                        </View>

                                        {/* Selected Interests Chips */}
                                        {selectedInterests.length > 0 && (
                                            <View style={styles.selectedInterestsContainer}>
                                                {selectedInterests.map((interest, index) => (
                                                    <View key={index} style={styles.interestChip}>
                                                        <Text style={styles.interestChipText}>{interest}</Text>
                                                        <TouchableOpacity onPress={() => removeInterest(interest)}>
                                                            <MaterialIcons name="close" size={16} color="#FF7800" />
                                                        </TouchableOpacity>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                </View>
                                
                                {/* 🛑 UPDATED FILTER ROWS END HERE 🛑 */}

                                {/* Estimated Reach Badge */}
                                <View style={styles.reachBadge}>
                                    <MaterialCommunityIcons name="account-group" size={16} color="#FF7800" />
                                    <Text style={styles.reachText}>Estimated Reach:</Text>
                                    <Text style={styles.reachCount}>~1.5M - 2M</Text>
                                    <Text style={styles.reachLabel}> users</Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* --- QUESTION BUILDER SECTION (Example Question) --- */}
                <View style={[styles.sectionCard, {marginTop: 20}]}>
                    <View style={styles.sectionHeaderContainer}>
                        <MaterialCommunityIcons name="help-circle-outline" size={24} color="#FF7800" />
                        <View style={styles.sectionHeaderText}>
                            <Text style={styles.sectionTitle}>Question Builder</Text>
                            <Text style={styles.sectionSubtitle}>Create and manage questions for your form</Text>
                        </View>
                        <TouchableOpacity style={styles.addQuestionTypeButton} onPress={addNewQuestion}>
                            <Text style={styles.addQuestionTypeButtonText}>+ Question</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Question Navigation */}
                    {questions.length > 1 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.questionNavigation}>
                            {questions.map((question, index) => (
                                <TouchableOpacity
                                    key={question.id}
                                    style={[
                                        styles.questionNavItem,
                                        currentQuestionIndex === index && styles.activeQuestionNavItem
                                    ]}
                                    onPress={() => setCurrentQuestionIndex(index)}
                                >
                                    <Text style={[
                                        styles.questionNavText,
                                        currentQuestionIndex === index && styles.activeQuestionNavText
                                    ]}>
                                        Q{index + 1}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    {/* Individual Question Card */}
                    <View style={styles.questionCard}>
                        
                        <View style={styles.questionCardHeader}>
                            <TouchableOpacity style={styles.dragHandle}>
                                <MaterialIcons name="drag-handle" size={20} color="#ccc" />
                            </TouchableOpacity>

                            <View style={styles.questionNumberSquare}>
                                <Text style={styles.questionNumber}>{currentQuestionIndex + 1}</Text>
                            </View>

                            <View style={styles.questionTitleContainer}>
                                <Text style={styles.questionTitleText}>Question {currentQuestionIndex + 1}</Text>
                                <Text style={styles.questionRequiredText}>
                                    {questions[currentQuestionIndex].isRequired ? 'Required question' : 'Optional question'}
                                </Text>
                            </View>

                            {/* wired delete button to remove the current question */}
                            <TouchableOpacity style={styles.deleteButton} onPress={() => removeQuestion(currentQuestionIndex)}>
                                <MaterialIcons name="delete-outline" size={22} color="#888" />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.questionTextInput}
                            placeholder="Enter your question"
                            placeholderTextColor="#aaa"
                            value={questions[currentQuestionIndex].questionText}
                            onChangeText={updateQuestionText}
                        />
                        
                        {/* Question Type Dropdown */}
                        <Text style={styles.inputLabel}>Question Type</Text>
                        {renderQuestionTypeDropdown()}

                        {/* Options (Only show for question types that need options) */}
                        {['multiple_choice', 'checkboxes', 'dropdown'].includes(questions[currentQuestionIndex].questionType) && (
                            <>
                                <Text style={styles.inputLabel}>Options</Text>
                                {questions[currentQuestionIndex].options.map((option, optionIndex) => {
                                    const letter = String.fromCharCode(65 + optionIndex);
                                    const badgeColor = optionBadgeColors[optionIndex % optionBadgeColors.length];
                                    return (
                                        <View key={optionIndex} style={styles.optionRow}>
                                            <View style={[styles.optionBadge, { backgroundColor: badgeColor }]}>
                                                <Text style={styles.optionBadgeText}>{letter}</Text>
                                            </View>
                                            <TextInput 
                                                style={styles.optionInput} 
                                                placeholder={`Option ${optionIndex + 1}`} 
                                                placeholderTextColor="#aaa"
                                                value={option}
                                                onChangeText={(text) => updateOptionText(optionIndex, text)}
                                            />
                                            {questions[currentQuestionIndex].options.length > 1 && (
                                                <TouchableOpacity onPress={() => removeOption(optionIndex)} style={styles.optionRemoveButton}>
                                                    <MaterialIcons name="close" size={20} color="#aaa" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    );
                                })}
                                
                                <TouchableOpacity style={styles.addOptionButtonDashed} onPress={addNewOption}>
                                    <Text style={styles.addOptionTextDashed}>+ Add Option</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Question Settings */}
                        <Text style={[styles.inputLabel, { marginTop: 10 }]}>Question Settings</Text>
                        <View style={styles.questionSettingsBox}>
                            <View style={styles.settingsRow}>
                                <View>
                                    <Text style={styles.settingsLabel}>Required Question</Text>
                                    <Text style={styles.settingsSubLabel}>Users must answer this</Text>
                                </View>
                                <Switch
                                    trackColor={{ false: "#767577", true: "#FFD464" }}
                                    thumbColor={questions[currentQuestionIndex].isRequired ? "#FF7800" : "#f4f3f4"}
                                    onValueChange={toggleQuestionRequired}
                                    value={questions[currentQuestionIndex].isRequired}
                                />
                            </View>

                            <TouchableOpacity style={styles.addImageButtonDashed}>
                                <MaterialIcons name="image" size={18} color="#888" />
                                <Text style={styles.addImageButtonText}>Add image or icon</Text>
                            </TouchableOpacity>

                            <TextInput
                                style={styles.descriptionInput}
                                placeholder="Add description or hint (optional)"
                                placeholderTextColor="#bbb"
                                multiline
                            />
                        </View>
                    </View>

                    {/* Add new question button */}
                    <TouchableOpacity style={styles.addNewQuestionButton} onPress={addNewQuestion}>
                        <MaterialIcons name="add" size={24} color="#fff" />
                        <Text style={styles.addNewQuestionButtonText}>Add New Question</Text>
                    </TouchableOpacity>
                </View>

                {/* --- BOTTOM ACTIONS --- */}
                <View style={styles.bottomActionsContainer}>
                    <TouchableOpacity style={styles.previewButton}>
                        <MaterialIcons name="visibility" size={20} color="#666" />
                        <Text style={styles.previewButtonText}>Preview Form</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.saveDraftButton}>
                        <MaterialCommunityIcons name="content-save-outline" size={20} color="#FF7800" />
                        <Text style={styles.saveDraftButtonText}>Save as Draft</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* SubCategory Selection Modal */}
            <Modal
                visible={showSubCategoryModal}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setShowSubCategoryModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowSubCategoryModal(false)} style={styles.modalCloseButton}>
                            <MaterialIcons name="arrow-back" size={28} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Select {selectedMainCategory?.name} Interests</Text>
                        <View style={{ width: 28 }} />
                    </View>

                    <ScrollView contentContainerStyle={styles.modalContent}>
                        {selectedMainCategory?.subCategories.map((subCategory, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.subCategoryItem,
                                    isSubCategorySelected(subCategory) && styles.subCategoryItemSelected
                                ]}
                                onPress={() => handleSubCategorySelect(subCategory)}
                            >
                                <MaterialIcons
                                    name={isSubCategorySelected(subCategory) ? 'check-circle' : 'radio-button-unchecked'}
                                    size={20}
                                    color={isSubCategorySelected(subCategory) ? '#FF7800' : '#999'}
                                    style={{ marginRight: 10 }}
                                />
                                <Text style={[
                                    styles.subCategoryText,
                                    isSubCategorySelected(subCategory) && styles.subCategoryTextSelected
                                ]}>
                                    {subCategory}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <TouchableOpacity 
                        onPress={() => setShowSubCategoryModal(false)} 
                        style={styles.modalDoneButton}
                    >
                        <LinearGradient
                            colors={['#FF7E1D', '#FFD464']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.saveButtonGradient}
                        >
                            <Text style={styles.saveButtonText}>Done</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

// --- STYLES ---

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F4E6', 
    },
    
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        padding: 5,
    },

    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 70, 
        paddingBottom: 40,
    },

    header: {
        paddingHorizontal: 10,
        alignItems: 'center',
        paddingTop: 10, 
        paddingBottom: 20,
    },
    largeIconContainer: {
        backgroundColor: '#FF7800',
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    mainHeading: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    descriptionText: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },

    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginTop: 10,
    },
    sectionHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionHeaderText: {
        marginLeft: 10,
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#666',
    },
    addQuestionTypeButton: {
        backgroundColor: '#FF7800',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
    },
    addQuestionTypeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },

    inputLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 8,
        marginTop: 15,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#f9f9f9',
    },
    multilineInput: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    
    // Dropdown Styles
    dropdownContainer: {
        position: 'relative',
        marginBottom: 10,
    },
    dropdownInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
        backgroundColor: '#f9f9f9',
        zIndex: 100,
    },
    disabledDropdown: {
        backgroundColor: '#f0f0f0',
        borderColor: '#e0e0e0',
    },
    dropdownPlaceholder: {
        fontSize: 14,
        color: '#aaa',
    },
    dropdownSelected: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    disabledText: {
        color: '#999',
    },
    dropdownOptions: {
        position: 'absolute',
        top: 55,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        maxHeight: 200,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 1000,
    },
    dropdownScrollView: {
        maxHeight: 198,
    },
    dropdownOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    selectedDropdownOption: {
        backgroundColor: '#FFF2E6',
    },
    dropdownOptionText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    selectedDropdownOptionText: {
        color: '#FF7800',
        fontWeight: '500',
    },
    
    // Question Type Dropdown Styles
    questionTypeDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFD464', 
        borderRadius: 10,
        padding: 12,
        backgroundColor: '#fff',
        marginBottom: 15,
        justifyContent: 'space-between',
    },
    questionTypeDropdownText: {
        flex: 1,
        fontSize: 16,
        color: '#FF7800',
        marginLeft: 10,
    },
    questionTypeOptions: {
        maxHeight: 300,
    },
    questionTypeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    selectedQuestionTypeOption: {
        backgroundColor: '#FFF2E6',
    },
    questionTypeIcon: {
        marginRight: 12,
    },
    questionTypeInfo: {
        flex: 1,
    },
    questionTypeName: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
        marginBottom: 2,
    },
    selectedQuestionTypeName: {
        color: '#FF7800',
    },
    questionTypeDescription: {
        fontSize: 12,
        color: '#666',
    },
    
    // Question Navigation
    questionNavigation: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    questionNavItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        marginRight: 8,
    },
    activeQuestionNavItem: {
        backgroundColor: '#FF7800',
    },
    questionNavText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeQuestionNavText: {
        color: '#fff',
    },
    
    // Locked Section Styles
    lockedSection: {
        backgroundColor: '#f8f8f8',
        borderColor: '#e0e0e0',
    },
    lockBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF7800',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    lockText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    lockedMessageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF2E6',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FFD464',
    },
    lockedMessage: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: '#FF7800',
        lineHeight: 18,
    },
    
    // Selected Interests Styles
    selectedInterestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    interestChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF2E6',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        marginRight: 8,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: '#FFD464',
    },
    interestChipText: {
        fontSize: 12,
        color: '#FF7800',
        marginRight: 5,
    },
    
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#F8F4E6',
        paddingHorizontal: 20,
        paddingTop: 50,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalCloseButton: {
        padding: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    modalContent: {
        paddingBottom: 20,
    },
    subCategoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    subCategoryItemSelected: {
        backgroundColor: '#FFF2E6',
        borderColor: '#FFD464',
    },
    subCategoryText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    subCategoryTextSelected: {
        color: '#FF7800',
        fontWeight: '500',
    },
    modalDoneButton: {
        marginTop: 20,
        marginBottom: 30,
    },
    saveButtonGradient: {
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 12,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1, 
    },
    switchDescription: {
        fontSize: 14,
        color: '#666',
        marginRight: 10,
    },

    // --- Nested Demographic Card Styles ---
    nestedCard: {
        backgroundColor: '#F8F8F8', 
        borderRadius: 10,
        padding: 15,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#eee',
        position: 'relative',
        zIndex: 1,
    },
    
    // Styles for labels and grouping 
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    filterInputGroup: {
        flex: 1,
        marginRight: 8,
        marginLeft: 8,
        position: 'relative',
    },
    filterLabel: {
        fontSize: 12,
        color: '#333',
        marginBottom: 5,
        fontWeight: 'bold',
    },
    
    reachBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF2E6', 
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginTop: 15,
        alignSelf: 'flex-start', 
        borderWidth: 1,
        borderColor: '#FFD464',
    },
    reachText: {
        fontSize: 13,
        color: '#FF7800',
        fontWeight: 'bold',
        marginLeft: 5,
    },
    reachCount: {
        fontSize: 13,
        color: '#FF7800',
        fontWeight: 'bold',
        marginLeft: 3,
    },
    reachLabel: {
        fontSize: 13,
        color: '#FF7800',
    },

    // QUESTION CARD (visual overhaul)
    questionCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 18,
        marginTop: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        borderWidth: 1.2, 
        borderColor: '#F2ECE6',
    },
    questionCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    dragHandle: {
        paddingRight: 8,
        paddingVertical: 2,
    },
    questionNumberSquare: {
        width: 34,
        height: 34,
        borderRadius: 8,
        backgroundColor: '#FF7800',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    questionNumber: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    questionTitleContainer: {
        flex: 1,
    },
    questionTitleText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#222',
    },
    questionRequiredText: {
        fontSize: 12,
        color: '#666',
    },
    deleteButton: {
        paddingLeft: 12,
    },
    questionTextInput: {
        borderWidth: 1,
        borderColor: '#EEE',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#fff',
        marginBottom: 12,
    },

    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        backgroundColor: '#fff',
    },
    optionBadge: {
        width: 34,
        height: 34,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    optionBadgeText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    optionInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 5, 
    },
    optionRemoveButton: {
        marginLeft: 10,
    },
    addOptionButtonDashed: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        marginTop: 10,
        marginBottom: 20,
        borderWidth: 1.2,
        borderStyle: 'dashed',
        borderColor: '#DDD',
        borderRadius: 12,
        backgroundColor: '#FFF',
    },
    addOptionTextDashed: {
        fontSize: 16,
        color: '#666',
    },
    addOptionText: {
        fontSize: 16,
        color: '#666',
        marginLeft: 5,
    },
    addQuestionSettings: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    addLogicButton: {
        borderWidth: 1,
        borderColor: '#FF7800',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
    },
    addLogicButtonText: {
        color: '#FF7800',
        fontWeight: 'bold',
        fontSize: 14,
    },
    addInfoButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#f9f9f9',
    },
    addInfoButtonText: {
        color: '#666',
        fontWeight: 'bold',
        fontSize: 14,
    },

    // New settings box
    questionSettingsBox: {
        marginTop: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        elevation: 1,
    },
    settingsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    settingsLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#222',
    },
    settingsSubLabel: {
        fontSize: 12,
        color: '#666',
    },
    addImageButtonDashed: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#DDD',
        borderRadius: 10,
        backgroundColor: '#fff',
        marginBottom: 12,
    },
    addImageButtonText: {
        marginLeft: 8,
        color: '#666',
    },
    descriptionInput: {
        borderWidth: 1,
        borderColor: '#F0F0F0',
        borderRadius: 10,
        padding: 10,
        fontSize: 14,
        color: '#666',
        backgroundColor: '#FAFAFA',
        minHeight: 44,
    },

    addNewQuestionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF7800',
        borderRadius: 15,
        paddingVertical: 15,
        marginTop: 20,
        elevation: 3,
        shadowColor: '#FF7800',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
    },
    addNewQuestionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
        marginLeft: 10,
    },

    bottomActionsContainer: {
        marginBottom: 20,
    },
    previewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingVertical: 15,
        marginTop: 20,
        borderWidth: 1.5,
        borderColor: '#FFD464',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    previewButtonText: {
        color: '#666',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 10,
    },
    saveDraftButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingVertical: 15,
        marginTop: 15,
        borderWidth: 1.5,
        borderColor: '#FFD464',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    saveDraftButtonText: {
        color: '#FF7800',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 10,
    },
});

export default CreateNewSurveyScreen;
