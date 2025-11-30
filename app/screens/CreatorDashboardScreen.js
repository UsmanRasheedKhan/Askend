// app/screens/CreatorDashboardScreen.js

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CreatorDashboardScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  
  const [draftsCount, setDraftsCount] = useState(0);
  const [publishedCount, setPublishedCount] = useState(5); // Keeping your existing published count
  const [finishedCount, setFinishedCount] = useState(2); // Keeping your existing finished count

  // Load drafts count when screen is focused
  useEffect(() => {
    loadDraftsCount();
  }, [isFocused]);

  const loadDraftsCount = async () => {
    try {
      const savedDrafts = await AsyncStorage.getItem('surveyDrafts');
      const drafts = savedDrafts ? JSON.parse(savedDrafts) : [];
      setDraftsCount(drafts.length);
    } catch (error) {
      console.error('Error loading drafts count:', error);
      setDraftsCount(0);
    }
  };

  const handleDraftsPress = () => {
    navigation.navigate('DraftsScreen'); // You'll need to create this screen
  };

  const handlePublishedPress = () => {
    // Navigate to published surveys screen
    Alert.alert("Published Surveys", "Navigate to published surveys screen");
  };

  const handleFinishedPress = () => {
    // Navigate to finished surveys screen
    Alert.alert("Finished Surveys", "Navigate to finished surveys screen");
  };

  return (
    <View style={styles.container}>
      {/* 1. TOP HEADER SECTION (Gradient Background) */}
      <LinearGradient
        colors={["#FF7800", "#FFD464"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome, Mariam</Text>
            <Text style={styles.headerSubtitle}>
              Design and Manage your surveys
            </Text>
          </View>

          {/* Survey Icon (Top Right) */}
          <View>
            <MaterialCommunityIcons
              name="clipboard-edit-outline"
              size={35}
              color="#fff"
            />
          </View>
        </View>
      </LinearGradient>

      {/* 2. MAIN SCROLLABLE CONTENT */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* My Surveys Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Surveys</Text>
        </View>

        {/* Drafts Card */}
        <SurveyStatusCard
          iconName="pencil-outline"
          title="Drafts"
          description="Work in progress"
          count={draftsCount}
          onPress={handleDraftsPress}
          iconStartColor="#FFD464"
        />

        {/* Published Card */}
        <SurveyStatusCard
          iconName="send"
          title="Published"
          description="Live and collecting"
          count={publishedCount}
          onPress={handlePublishedPress}
          iconStartColor="#FFD464"
        />

        {/* Finished Card */}
        <SurveyStatusCard
          iconName="check-circle-outline"
          title="Finished"
          description="Analysis ready"
          count={finishedCount}
          onPress={handleFinishedPress}
          iconStartColor="#FFD464"
        />

        {/* Floating Action Button (FAB) MOVED INSIDE SCROLLVIEW */}
        <TouchableOpacity
          style={styles.fabButtonInScroll}
          onPress={() => navigation.navigate("CreateNewSurvey")}
        >
          <LinearGradient
            colors={["#FF7800", "#FFD464"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fabGradient}
          >
            <MaterialIcons name="add" size={35} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* 3. STATIC BOTTOM NAVIGATION BAR */}
      <LinearGradient
        colors={["#FF7800", "#FFD464"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bottomNav}
      >
        {/* Creator only has one main tab: Surveys, which is active */}
        <TabItem iconName="clipboard-list" label="Surveys" isCurrent={true} />
      </LinearGradient>
    </View>
  );
};

// --- SUB-COMPONENTS ---

// Component for Status Cards
const SurveyStatusCard = ({
  iconName,
  title,
  description,
  count,
  onPress,
  iconStartColor,
}) => (
  <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
    {/* Card Background Gradient - Simulates the light, subtle color */}
    <LinearGradient
      colors={["#FFFFFF", "#FFF8E1"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.cardGradient}
    >
      <View style={styles.cardContent}>
        {/* Icon Container with Square shape and slight border radius */}
        <LinearGradient
          colors={["#FF9933", "#FFD464"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardIconContainer}
        >
          <MaterialCommunityIcons name={iconName} size={30} color="#fff" />
        </LinearGradient>

        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
      </View>

      {/* Count Badge (Circular Gradient) */}
      <LinearGradient
        colors={["#FF7800", "#FFD464"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.countBadge}
      >
        <Text style={styles.countText}>{count}</Text>
      </LinearGradient>
    </LinearGradient>
  </TouchableOpacity>
);

// Component for the Static Bottom Navigation Items
const TabItem = ({ iconName, label, isCurrent }) => (
  <View style={styles.tabItem}>
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
  </View>
);

// ----------------------------------------------------
// 🎨 STYLES

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  // --- Header Styles ---
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },

  // --- Scroll Content Styles ---
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 0,
  },

  // --- Card Styles ---
  cardContainer: {
    marginVertical: 15,
    borderRadius: 15,
    backgroundColor: "transparent",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FFD464",
  },
  cardGradient: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderRadius: 15,
    minHeight: 100,
    shadowColor: "#FFD464",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  cardText: {
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  cardDescription: {
    fontSize: 15,
    color: "#666",
  },
  countBadge: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  countText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },

  // --- Floating Action Button (FAB) moved to be part of the flow ---
  fabButtonInScroll: {
    alignSelf: "flex-end",
    marginTop: 20,
    marginRight: 10,
    width: 70,
    height: 70,
    borderRadius: 35,
    elevation: 8,
    shadowColor: "#FF7800",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    overflow: "hidden",
    marginBottom: 50,
  },
  fabGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // --- Bottom Navigation Styles (Static) ---
  bottomNav: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 70,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabItem: {
    alignItems: "center",
    padding: 5,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "bold",
  },
});

export default CreatorDashboardScreen;