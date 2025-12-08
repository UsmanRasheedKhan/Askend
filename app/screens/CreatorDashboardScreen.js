import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
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
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (isFocused) {
      loadUserData();
    }
    
    if (route.params?.showMessage) {
      setMessage(route.params.showMessage);
      setTimeout(() => setMessage(''), 3000);
    }
  }, [isFocused, route.params?.refresh, route.params?.showMessage]);

  // ✅ LOAD CURRENT USER AND THEIR DATA
  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // 1. Get current logged in user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        Alert.alert("Session Expired", "Please sign in again");
        navigation.navigate("SignIn");
        return;
      }
      
      setCurrentUser(user);
      console.log('✅ Current User:', {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.user_role
      });
      
      // 2. Get user name from profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();
      
      if (!profileError && profileData?.full_name) {
        const firstName = profileData.full_name.split(' ')[0];
        setUserName(firstName);
      } else {
        // Fallback to email username
        setUserName(user.email?.split('@')[0] || 'Creator');
      }
      
      // 3. Load user's surveys data
      await loadUserSurveys(user.id);
      
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOAD ONLY CURRENT USER'S SURVEYS
  const loadUserSurveys = async (userId) => {
    try {
      console.log('🔍 DEBUG - UserId:', userId);
      console.log('🔍 DEBUG - UserId length:', userId.length);
      console.log('🔍 DEBUG - UserId type:', typeof userId);
      
      // Test query directly - DEBUG
      const { data: testData, error: testError } = await supabase
        .from('surveys')
        .select('*')
        .eq('user_id', userId)
        .limit(2);
        
      console.log('🔍 DEBUG - Test query results:', testData?.length || 0);
      if (testError) {
        console.log('🔍 DEBUG - Test error:', testError);
      } else if (testData && testData.length > 0) {
        console.log('🔍 DEBUG - Sample surveys:', testData.map(s => ({ id: s.id, title: s.title, status: s.status })));
      }
      
      console.log('📊 Loading surveys for user:', userId.substring(0, 8) + '...');
      
      // ✅ DRAFTS COUNT - CURRENT USER ONLY
      const { count: draftsCount, error: draftsError } = await supabase
        .from('surveys')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft')
        .eq('user_id', userId);
      
      if (draftsError) {
        console.error('❌ Drafts count error:', draftsError);
        Alert.alert("Query Error", "Failed to load drafts count");
      } else {
        setDraftsCount(draftsCount || 0);
        console.log('📝 Drafts count:', draftsCount || 0);
      }

      // ✅ PUBLISHED COUNT - CURRENT USER ONLY
      const { count: publishedCount, error: publishedError } = await supabase
        .from('surveys')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')
        .eq('user_id', userId);
      
      if (publishedError) {
        console.error('❌ Published count error:', publishedError);
        Alert.alert("Query Error", "Failed to load published count");
      } else {
        setPublishedCount(publishedCount || 0);
        console.log('📢 Published count:', publishedCount || 0);
      }

      // ✅ FINISHED COUNT - CURRENT USER ONLY
      const { count: finishedCount, error: finishedError } = await supabase
        .from('surveys')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'finished')
        .eq('user_id', userId);
      
      if (finishedError) {
        console.error('❌ Finished count error:', finishedError);
        Alert.alert("Query Error", "Failed to load finished count");
      } else {
        setFinishedCount(finishedCount || 0);
        console.log('✅ Finished count:', finishedCount || 0);
      }

      // ✅ VERIFY DATA LOADED CORRECTLY
      const { data: userSurveys, error: allError } = await supabase
        .from('surveys')
        .select('id, title, status, user_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (allError) {
        console.error('❌ All surveys error:', allError);
      } else if (userSurveys) {
        console.log(`🔍 Loaded ${userSurveys.length} surveys for current user`);
        if (userSurveys.length > 0) {
          userSurveys.forEach(survey => {
            console.log(`   • "${survey.title.substring(0, 20)}..." - Status: ${survey.status}`);
          });
        } else {
          console.log('❌ No surveys found for user');
          
          // Check if surveys exist for any user
          const { data: allSurveysCheck, error: checkError } = await supabase
            .from('surveys')
            .select('id, title, user_id, status')
            .limit(3);
          
          if (!checkError && allSurveysCheck) {
            console.log('🔍 First 3 surveys in database:', allSurveysCheck.map(s => ({
              id: s.id,
              title: s.title,
              user_id: s.user_id,
              status: s.status
            })));
          }
        }
      }

    } catch (error) {
      console.error('❌ Error loading user surveys:', error);
      Alert.alert("Error", "Failed to load surveys data");
    }
  };

  // ✅ REFRESH DATA
  const refreshData = async () => {
    setRefreshing(true);
    if (currentUser) {
      await loadUserSurveys(currentUser.id);
    } else {
      await loadUserData();
    }
    setRefreshing(false);
  };

  // ✅ HANDLE DRAFTS PRESS
  const handleDraftsPress = () => {
    navigation.navigate('DraftsScreen');
  };

  // ✅ HANDLE PUBLISHED PRESS
  const handlePublishedPress = () => {
    navigation.navigate('PublishedSurveysScreen');
  };

  // ✅ HANDLE FINISHED PRESS
  const handleFinishedPress = () => {
    if (finishedCount > 0) {
      navigation.navigate('FinishedSurveysScreen');
    } else {
      Alert.alert(
        "No Finished Surveys",
        "You haven't finished any surveys yet.\n\nTo finish a survey:\n1. Go to Published Surveys\n2. Click ••• on a survey\n3. Select 'Finish Survey'\n\nIt will then appear here!",
        [
          { 
            text: "Go to Published", 
            onPress: () => navigation.navigate('PublishedSurveysScreen')
          },
          { text: "OK", style: "cancel" }
        ]
      );
    }
  };

  // ✅ NAVIGATION HANDLERS
  const handleNavigateToWallet = () => {
    navigation.navigate('WalletScreen');
  };

  const handleNavigateToProfile = () => {
    navigation.navigate('ProfileViewScreen');
  };

  // ✅ CREATE NEW SURVEY
  const handleCreateNewSurvey = () => {
    navigation.navigate("CreateNewSurvey");
  };

  // ✅ LOADING STATE
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7800" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  // ✅ MAIN RENDER
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient
        colors={["#FF7800", "#FFD464"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.welcomeText}>
              Welcome, {userName}
            </Text>
            <Text style={styles.headerSubtitle}>
              Design and Manage your surveys
            </Text>
          </View>

          <View style={styles.headerIconContainer}>
            <MaterialCommunityIcons
              name="clipboard-edit-outline"
              size={35}
              color="#fff"
            />
          </View>
        </View>
        
        {/* REFRESH BUTTON */}
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={refreshData}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialIcons name="refresh" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </LinearGradient>

      {/* SUCCESS MESSAGE BANNER */}
      {message ? (
        <View style={styles.messageBanner}>
          <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
          <Text style={styles.messageText}>{message}</Text>
        </View>
      ) : null}

      {/* MAIN CONTENT */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshData}
            colors={['#FF7800']}
            tintColor="#FF7800"
          />
        }
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Surveys</Text>
          <Text style={styles.surveyCountNote}>
            Total: {draftsCount + publishedCount + finishedCount}
          </Text>
        </View>

        {/* DRAFTS CARD */}
        <SurveyStatusCard
          iconName="pencil-outline"
          title="Drafts"
          description="Work in progress"
          count={draftsCount}
          onPress={handleDraftsPress}
          disabled={draftsCount === 0}
        />

        {/* PUBLISHED CARD */}
        <SurveyStatusCard
          iconName="send"
          title="Published"
          description="Live and collecting"
          count={publishedCount}
          onPress={handlePublishedPress}
          disabled={publishedCount === 0}
        />

        {/* FINISHED CARD */}
        <SurveyStatusCard
          iconName="check-circle-outline"
          title="Finished"
          description="Analysis ready"
          count={finishedCount}
          onPress={handleFinishedPress}
          disabled={finishedCount === 0}
        />

        <View style={styles.extraSpacing} />

        {/* CREATE NEW SURVEY BUTTON */}
        <TouchableOpacity
          style={styles.fabButtonInScroll}
          onPress={handleCreateNewSurvey}
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
        
        {/* DEBUG INFO - REMOVE IN PRODUCTION */}
        {__DEV__ && currentUser && (
          <View style={styles.debugInfo}>
            <Text style={styles.debugTitle}>Debug Info:</Text>
            <Text style={styles.debugText}>User: {currentUser.email}</Text>
            <Text style={styles.debugText}>ID: {currentUser.id.substring(0, 12)}...</Text>
            <Text style={styles.debugText}>Expected ID: 23b58383-05f6-4d01-8642-38af876606ed</Text>
            <Text style={styles.debugText}>Match: {currentUser.id === '23b58383-05f6-4d01-8642-38af876606ed' ? '✅ YES' : '❌ NO'}</Text>
            <Text style={styles.debugText}>Role: {currentUser.user_metadata?.user_role || 'not set'}</Text>
          </View>
        )}
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <LinearGradient
        colors={["#FF7800", "#FFD464"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bottomNav}
      >
        <TabItem 
          iconName="clipboard-list" 
          label="Surveys" 
          isCurrent={true} 
          onPress={() => {}} 
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
          isCurrent={false} 
          onPress={handleNavigateToProfile}
        />
      </LinearGradient>
    </View>
  );
};

// ✅ SURVEY STATUS CARD COMPONENT
const SurveyStatusCard = ({ iconName, title, description, count, onPress, disabled }) => (
  <TouchableOpacity 
    style={[
      styles.cardContainer,
      disabled && styles.disabledCard
    ]} 
    onPress={onPress}
    disabled={disabled}
    activeOpacity={disabled ? 1 : 0.7}
  >
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

// ✅ TAB ITEM COMPONENT
const TabItem = ({ iconName, label, isCurrent, onPress }) => (
  <TouchableOpacity style={styles.tabItem} onPress={onPress} activeOpacity={0.7}>
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

// ✅ STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
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
  headerTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  headerIconContainer: {
    padding: 10,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  refreshButton: {
    position: 'absolute',
    right: 20,
    top: 60,
    padding: 5,
  },
  messageBanner: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    marginHorizontal: 20,
    marginTop: -15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  surveyCountNote: {
    fontSize: 12,
    color: "#666",
    fontStyle: 'italic',
  },
  extraSpacing: {
    height: 20,
  },
  cardContainer: {
    marginVertical: 12,
    borderRadius: 15,
    backgroundColor: "transparent",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FFD464",
  },
  disabledCard: {
    opacity: 0.6,
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
    flex: 1,
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
    flex: 1,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
  },
  countBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
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
  debugInfo: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 5,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
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

export default CreatorDashboardScreen;