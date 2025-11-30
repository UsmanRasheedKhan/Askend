// COMPLETE REWRITTEN UI — ENHANCED VISUAL DESIGN
// ChoosePlanScreen.js

import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    Dimensions,
    Animated,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// --------------------------------------------------------------
// 🔹 REUSABLE PLAN CARD — ENHANCED DESIGN
// --------------------------------------------------------------
const PlanCard = ({ title, subtitle, price, responses, buttonText, gradient, iconColor, badge, isSelected, onSelect }) => {
    return (
        <TouchableOpacity 
            style={[
                styles.cardOuterWrapper,
                isSelected && styles.selectedCard
            ]} 
            onPress={onSelect}
            activeOpacity={0.9}
        >
            <LinearGradient
                colors={gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardContainer}
            >
                {badge && (
                    <View style={styles.badgeBox}>
                        <Text style={styles.badgeText}>🔥 Popular</Text>
                    </View>
                )}

                <View style={styles.cardHeader}>
                    <View style={[styles.iconCircle, { backgroundColor: iconColor + '20' }]}>
                        <MaterialCommunityIcons name="chart-bar" size={26} color={iconColor} />
                    </View>
                    
                    {isSelected && (
                        <View style={styles.selectedIndicator}>
                            <MaterialIcons name="check-circle" size={24} color="#FF7E1D" />
                        </View>
                    )}
                </View>

                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{title}</Text>
                    <Text style={styles.cardSubtitle}>{subtitle}</Text>

                    <View style={styles.priceContainer}>
                        <Text style={styles.priceText}>Rs {price}</Text>
                        <Text style={styles.responsesText}>for {responses} responses</Text>
                    </View>

                    <Text style={styles.pricePerResponse}>
                        Rs {(price / responses).toFixed(2)} per response
                    </Text>
                </View>

                <TouchableOpacity 
                    style={[
                        styles.selectBtn,
                        isSelected && styles.selectedBtn
                    ]}
                    onPress={onSelect}
                >
                    <Text style={[
                        styles.selectBtnText,
                        isSelected && styles.selectedBtnText
                    ]}>
                        {isSelected ? 'Selected' : buttonText}
                    </Text>
                </TouchableOpacity>
            </LinearGradient>
        </TouchableOpacity>
    );
};

// --------------------------------------------------------------
// 🔹 CUSTOM PLAN CARD — ENHANCED
// --------------------------------------------------------------
const CustomPlan = ({ isSelected, onSelect, customResponses, setCustomResponses }) => {
    const cost = customResponses ? parseInt(customResponses) * 2 : 0;

    return (
        <TouchableOpacity 
            style={[
                styles.cardOuterWrapper,
                isSelected && styles.selectedCard
            ]} 
            onPress={onSelect}
            activeOpacity={0.9}
        >
            <LinearGradient
                colors={["#ECE7FF", "#FFFFFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardContainer}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.iconCirclePurple}>
                        <MaterialCommunityIcons name="cog" size={26} color="#fff" />
                    </View>
                    
                    {isSelected && (
                        <View style={styles.selectedIndicator}>
                            <MaterialIcons name="check-circle" size={24} color="#7C58FF" />
                        </View>
                    )}
                </View>

                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Custom Plan</Text>
                    <Text style={styles.cardSubtitle}>Need a custom number of responses?</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Enter number of responses</Text>
                        <TextInput
                            style={[
                                styles.inputBox,
                                isSelected && styles.inputBoxSelected
                            ]}
                            keyboardType="numeric"
                            placeholder="e.g. 500"
                            placeholderTextColor="#b6b6b6"
                            value={customResponses}
                            onChangeText={setCustomResponses}
                            onFocus={onSelect}
                        />
                    </View>

                    <View style={styles.costRow}>
                        <Text style={styles.inputLabel}>Estimated Cost:</Text>
                        <Text style={styles.costValue}>Rs {cost || '0'}</Text>
                    </View>
                </View>

                <TouchableOpacity 
                    style={[
                        styles.selectBtn,
                        isSelected && styles.selectedBtnCustom
                    ]}
                    onPress={onSelect}
                >
                    <Text style={[
                        styles.selectBtnText,
                        isSelected && styles.selectedBtnText
                    ]}>
                        {isSelected ? 'Selected' : 'Select Custom'}
                    </Text>
                </TouchableOpacity>
            </LinearGradient>
        </TouchableOpacity>
    );
};

// --------------------------------------------------------------
// 🔹 MAIN SCREEN — ENHANCED
// --------------------------------------------------------------
const ChoosePlanScreen = ({ navigation }) => {
    const [selectedPlan, setSelectedPlan] = useState('standard');
    const [customResponses, setCustomResponses] = useState('');

    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan);
        if (plan !== 'custom') {
            setCustomResponses('');
        }
    };

    const getSelectedPlanPrice = () => {
        switch(selectedPlan) {
            case 'basic': return 300;
            case 'standard': return 750;
            case 'premium': return 2000;
            case 'custom': return customResponses ? parseInt(customResponses) * 2 : 0;
            default: return 0;
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Enhanced Header */}
            <LinearGradient
                colors={["#FF7E1D", "#FFAD33"]}
                style={styles.headerGradient}
            >
                <View style={styles.header}>
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <MaterialIcons name="arrow-back-ios" size={22} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <View style={styles.headerIconBox}>
                            <MaterialCommunityIcons name="chart-bar" size={24} color="#FF7E1D" />
                        </View>
                        <Text style={styles.headerTitle}>Choose Your Plan</Text>
                    </View>

                    <View style={styles.placeholder} />
                </View>
            </LinearGradient>

            <ScrollView 
                contentContainerStyle={styles.scrollArea}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headerCard}>
                    <Text style={styles.headerCardTitle}>📊 Select Your Survey Plan</Text>
                    <Text style={styles.headerCardSubtitle}>
                        Choose the perfect plan for your survey needs. All plans include full feature access.
                    </Text>
                </View>

                {/* Basic Plan */}
                <PlanCard
                    title="Basic Plan"
                    subtitle="Perfect for small surveys and quick feedback"
                    price="300"
                    responses="100"
                    buttonText="Select Basic"
                    gradient={["#E8F5E8", "#C8E6C9"]}
                    iconColor="#4CAF50"
                    isSelected={selectedPlan === 'basic'}
                    onSelect={() => handlePlanSelect('basic')}
                />

                {/* Standard Plan */}
                <PlanCard
                    title="Standard Plan"
                    subtitle="Great for growing businesses and medium surveys"
                    price="750"
                    responses="300"
                    buttonText="Select Standard"
                    gradient={["#FFF3E0", "#FFE0B2"]}
                    iconColor="#FF9800"
                    badge
                    isSelected={selectedPlan === 'standard'}
                    onSelect={() => handlePlanSelect('standard')}
                />

                {/* Premium */}
                <PlanCard
                    title="Premium Plan"
                    subtitle="For large-scale surveys and enterprise needs"
                    price="2000"
                    responses="1000"
                    buttonText="Select Premium"
                    gradient={["#FCE4EC", "#F8BBD0"]}
                    iconColor="#E91E63"
                    isSelected={selectedPlan === 'premium'}
                    onSelect={() => handlePlanSelect('premium')}
                />

                {/* Custom */}
                <CustomPlan
                    isSelected={selectedPlan === 'custom'}
                    onSelect={() => handlePlanSelect('custom')}
                    customResponses={customResponses}
                    setCustomResponses={setCustomResponses}
                />

                {/* Features Comparison */}
                <View style={styles.featuresCard}>
                    <Text style={styles.featuresTitle}>All Plans Include:</Text>
                    <View style={styles.featuresList}>
                        <View style={styles.featureItem}>
                            <MaterialIcons name="check-circle" size={18} color="#4CAF50" />
                            <Text style={styles.featureText}>Unlimited Questions</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <MaterialIcons name="check-circle" size={18} color="#4CAF50" />
                            <Text style={styles.featureText}>Real-time Analytics</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <MaterialIcons name="check-circle" size={18} color="#4CAF50" />
                            <Text style={styles.featureText}>Data Export</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <MaterialIcons name="check-circle" size={18} color="#4CAF50" />
                            <Text style={styles.featureText}>24/7 Support</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Enhanced Bottom Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total Amount:</Text>
                    <Text style={styles.totalAmount}>Rs {getSelectedPlanPrice()}</Text>
                </View>
                
                <TouchableOpacity 
                    style={styles.publishBtn}
                    onPress={() => {
                        // Handle publish logic
                        alert(`Selected ${selectedPlan} plan for Rs ${getSelectedPlanPrice()}`);
                    }}
                >
                    <LinearGradient
                        colors={["#FF7E1D", "#FFAD33"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.publishGradient}
                    >
                        <MaterialIcons name="send" size={20} color="#fff" />
                        <Text style={styles.publishText}>Publish Survey</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.securityRow}>
                    <MaterialIcons name="security" size={16} color="#4CAF50" />
                    <Text style={styles.securityText}>
                        Secure payment • Cancel anytime • 24/7 support
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

// --------------------------------------------------------------
// 🔹 ENHANCED STYLES
// --------------------------------------------------------------
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    headerGradient: {
        paddingTop: 50,
        paddingBottom: 20,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },
    backButton: {
        padding: 8,
    },
    headerCenter: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerIconBox: {
        width: 40,
        height: 40,
        backgroundColor: "#fff",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#fff",
    },
    placeholder: {
        width: 40,
    },
    scrollArea: {
        padding: 16,
        paddingBottom: 120,
    },
    headerCard: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    headerCardTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333",
        marginBottom: 8,
    },
    headerCardSubtitle: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },
    cardOuterWrapper: {
        marginBottom: 16,
        borderRadius: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    selectedCard: {
        transform: [{ scale: 1.02 }],
        elevation: 6,
        shadowColor: "#FF7E1D",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
    },
    cardContainer: {
        borderRadius: 20,
        padding: 20,
        minHeight: 220,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    iconCirclePurple: {
        width: 50,
        height: 50,
        borderRadius: 14,
        backgroundColor: "#7C58FF",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    selectedIndicator: {
        marginTop: -5,
        marginRight: -5,
    },
    badgeBox: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: "#FF7E1D",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 12,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#222",
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 15,
        lineHeight: 18,
    },
    priceContainer: {
        marginBottom: 8,
    },
    priceText: {
        fontSize: 28,
        fontWeight: "800",
        color: "#222",
    },
    responsesText: {
        fontSize: 14,
        color: "#666",
        marginTop: 2,
    },
    pricePerResponse: {
        fontSize: 12,
        color: "#888",
        fontStyle: 'italic',
        marginBottom: 15,
    },
    selectBtn: {
        backgroundColor: "#fff",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "transparent",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    selectedBtn: {
        backgroundColor: "#FF7E1D",
        borderColor: "#FF7E1D",
    },
    selectedBtnCustom: {
        backgroundColor: "#7C58FF",
        borderColor: "#7C58FF",
    },
    selectBtnText: {
        color: "#222",
        fontWeight: "700",
        fontSize: 15,
    },
    selectedBtnText: {
        color: "#fff",
    },
    inputContainer: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#444",
        marginBottom: 8,
    },
    inputBox: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#e5e5e5",
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: "#222",
    },
    inputBoxSelected: {
        borderColor: "#7C58FF",
        backgroundColor: "#F8F7FF",
    },
    costRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderColor: "#e8e8e8",
        paddingTop: 12,
        marginBottom: 15,
    },
    costValue: {
        fontWeight: "800",
        fontSize: 18,
        color: "#7C58FF",
    },
    featuresCard: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 16,
        marginTop: 10,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    featuresTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#333",
        marginBottom: 12,
    },
    featuresList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        marginBottom: 8,
    },
    featureText: {
        fontSize: 13,
        color: "#666",
        marginLeft: 6,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderColor: "#f0f0f0",
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: "800",
        color: "#FF7E1D",
    },
    publishBtn: {
        borderRadius: 14,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: "#FF7E1D",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    publishGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    publishText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "800",
        marginLeft: 8,
    },
    securityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
    },
    securityText: {
        fontSize: 12,
        color: "#888",
        marginLeft: 6,
    },
});

export default ChoosePlanScreen;