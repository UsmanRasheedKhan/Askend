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
import { useNavigation, useIsFocused, useRoute } from "@react-navigation/native";
import { supabase } from "../../supabaseClient";

const CreatorDashboardScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const route = useRoute();
  
  const [draftsCount, setDraftsCount] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [finishedCount, setFinishedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, [isFocused, route.params?.refresh]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      console.log('📊 Loading dashboard counts from Supabase...');
      
      // ✅ DRAFTS COUNT
      const { count: draftsCount, error: draftsError } = await supabase
        .from('surveys')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft')
        .eq('user_id', 'user_001');
      
      if (draftsError) {
        console.error('Drafts count error:', draftsError);
      } else {
        setDraftsCount(draftsCount || 0);
        console.log('📝 Drafts count:', draftsCount || 0);
      }

      // ✅ PUBLISHED COUNT
      const { count: publishedCount, error: publishedError } = await supabase
        .from('surveys')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')
        .eq('user_id', 'user_001');
      
      if (publishedError) {
        console.error('Published count error:', publishedError);
      } else {
        setPublishedCount(publishedCount || 0);
        console.log('📢 Published count:', publishedCount || 0);
      }

      // ✅ FINISHED COUNT
      const { count: finishedCount, error: finishedError } = await supabase
        .from('surveys')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'finished')
        .eq('user_id', 'user_001');
      
      if (finishedError) {
        console.error('Finished count error:', finishedError);
      } else {
        setFinishedCount(finishedCount || 0);
        console.log('✅ Finished count:', finishedCount || 0);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert("Error", "Failed to load surveys data");
    } finally {
      setLoading(false);
    }
  };

  const handleDraftsPress = () => {
    navigation.navigate('DraftsScreen');
  };

  const handlePublishedPress = () => {
    navigation.navigate('PublishedSurveysScreen');
  };

  const handleFinishedPress = () => {
    Alert.alert(
      "Finished Surveys",
      "This feature is coming soon!",
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
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

          <View>
            <MaterialCommunityIcons
              name="clipboard-edit-outline"
              size={35}
              color="#fff"
            />
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Surveys</Text>
        </View>

        <SurveyStatusCard
          iconName="pencil-outline"
          title="Drafts"
          description="Work in progress"
          count={draftsCount}
          onPress={handleDraftsPress}
        />

        <SurveyStatusCard
          iconName="send"
          title="Published"
          description="Live and collecting"
          count={publishedCount}
          onPress={handlePublishedPress}
        />

        <SurveyStatusCard
          iconName="check-circle-outline"
          title="Finished"
          description="Analysis ready"
          count={finishedCount}
          onPress={handleFinishedPress}
        />

        {/* ✅ "Recently Published" section REMOVED */}
        
        {/* Add spacing */}
        <View style={styles.extraSpacing} />

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

      <LinearGradient
        colors={["#FF7800", "#FFD464"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bottomNav}
      >
        <TabItem iconName="clipboard-list" label="Surveys" isCurrent={true} />
      </LinearGradient>
    </View>
  );
};

const SurveyStatusCard = ({
  iconName,
  title,
  description,
  count,
  onPress,
}) => (
  <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
    <LinearGradient
      colors={["#FFFFFF", "#FFF8E1"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.cardGradient}
    >
      <View style={styles.cardContent}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
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
  extraSpacing: {
    height: 30, // Add some spacing
  },
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