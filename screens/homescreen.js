import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Dimensions,
  Platform, // Import Dimensions to get screen width
} from 'react-native';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';


import { Modal } from 'react-native'; // Add this to your imports

const API_URL = 'https://krishi-dev-backend.onrender.com'; // or your actual backend URL


// Get screen width for responsive button sizing
const { width } = Dimensions.get('window');

// --- SVG Icons (Corrected for React Native) ---
const LogoIcon = () => (
  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
      stroke="#4CAF50"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const FilterIcon = () => (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <Path d="M3 4h18v2H3V4zm3 5h12v2H6V9zm3 5h6v2H9v-2z" fill="#666"/>
    </Svg>
);

const SunCloudIcon = () => (
    <Svg width="60" height="60" viewBox="0 0 64 64" fill="none">
        <Path d="M47.2,34.5A14.9,14.9,0,0,0,33.4,22.7a12,12,0,0,0-11.8,12.2,12.6,12.6,0,0,0,.2,2.4,9.3,9.3,0,0,0-18,6.8,9.5,9.5,0,0,0,9.4,9.4H47.2a9.3,9.3,0,0,0,0-18.6Z" fill="#f9d71c"/>
        <Path d="M51.9,26.1a12,12,0,1,0-17-17A12,12,0,0,0,51.9,26.1Z" fill="#ffce00"/>
        <Path d="M47.2,43.8H13.8a9.4,9.4,0,0,1,0-18.8,9.3,9.3,0,0,1,8.3,4.9,1,1,0,0,0,1,.6,12.1,12.1,0,0,1,12.1-12,14.9,14.9,0,0,1,14.1,12.1,1,1,0,0,0,1,.8,9.3,9.3,0,0,1,9.3,9.4,9.4,9.4,0,0,1-9.4,9.4Z" fill="#f2f2f2"/>
    </Svg>
);

const BotIcon = () => (
    <Svg width="60" height="60" viewBox="0 0 24 24" fill="none">
        <Path d="M12 2a10 10 0 00-10 10v4a2 2 0 002 2h16a2 2 0 002-2v-4A10 10 0 0012 2z" fill="#facc15"/>
        <Path d="M9 12a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" fill="#1f2937"/>
        <Path fill="#4b5563" d="M9.5 16h5a.5.5 0 010 1h-5a.5.5 0 010-1z"/>
        <Path d="M4 12a8 8 0 018-8v0a8 8 0 018 8v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4z" fill="#fde047"/>
        <Path d="M9 12a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" fill="#1f2937"/>
        <Path fill="#4b5563" d="M9.5 16h5a.5.5 0 010 1h-5a.5.5 0 010-1z"/>
        <Path d="M12 4a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1A.5.5 0 0112 4z" fill="#4b5563"/>
    </Svg>
);

const LoanIcon = () => (
    <Svg width="60" height="60" viewBox="0 0 64 64" fill="none">
        <Path d="M32 58.7C17.3 58.7 5.3 46.7 5.3 32S17.3 5.3 32 5.3 58.7 17.3 58.7 32 46.7 58.7 32 58.7z" fill="#81c784"/>
        <Path d="M32 53.3C20.2 53.3 10.7 43.8 10.7 32S20.2 10.7 32 10.7 53.3 20.2 53.3 32 43.8 53.3 32 53.3z" fill="#a5d6a7"/>
        <Path d="M33.3 42.7c-3.2 0-5.8-2.6-5.8-5.8s2.6-5.8 5.8-5.8 5.8 2.6 5.8 5.8-2.6 5.8-5.8 5.8z" fill="#ffffff"/>
        <Path d="M36 29.3h-6.7c-1.5 0-2.7-1.2-2.7-2.7v-2.7c0-1.5 1.2-2.7 2.7-2.7H36c1.5 0 2.7 1.2 2.7 2.7v2.7c0 1.5-1.2 2.7-2.7 2.7z" fill="#ffffff"/>
        <Path d="M42.7 42.7H21.3c-1.5 0-2.7-1.2-2.7-2.7V24c0-1.5 1.2-2.7 2.7-2.7h21.3c1.5 0 2.7 1.2 2.7 2.7v16c0 1.5-1.2 2.7-2.7 2.7z" fill="#4caf50"/>
        <Path d="M40 40H24c-1.1 0-2-0.9-2-2V26c0-1.1 0.9-2 2-2h16c1.1 0 2 0.9 2 2v12C42 39.1 41.1 40 40 40z" fill="#66bb6a"/>
        <Path d="M32 36c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4S34.2 36 32 36z" fill="#fdd835"/>
        <Path d="M32 34.7c-1.5 0-2.7-1.2-2.7-2.7s1.2-2.7 2.7-2.7 2.7 1.2 2.7 2.7S33.5 34.7 32 34.7z" fill="#ffee58"/>
        <SvgText x="32" y="35" fontFamily="Arial-BoldMT, Arial" fontSize="12" fontWeight="bold" fill="#ffffff" textAnchor="middle">$</SvgText>
        <Path d="M48 21.3l-9.3 9.3-4-4" stroke="#e53935" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
);

const YoutubeIcon = () => (
    <Svg width="60" height="60" viewBox="0 0 24 24" fill="none">
        <Path d="M21.582 6.186A2.5 2.5 0 0019.99 4.7H4.01A2.5 2.5 0 001.418 6.186a26.888 26.888 0 000 11.628A2.5 2.5 0 004.01 19.3h15.98a2.5 2.5 0 002.592-1.486 26.888 26.888 0 000-11.628z" fill="#ff0000"/>
        <Path d="M9.857 15.571V8.429L15.714 12l-5.857 3.571z" fill="#ffffff"/>
    </Svg>
);

const NewsIcon = () => (
    <Svg width="60" height="60" viewBox="0 0 24 24" fill="none">
        <Path fillRule="evenodd" clipRule="evenodd" d="M2 6a4 4 0 014-4h12a4 4 0 014 4v12a4 4 0 01-4 4H6a4 4 0 01-4-4V6zm4-2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H6z" fill="#60A5FA"/>
        <Path d="M6 9h12v2H6V9zm0 4h8v2H6v-2z" fill="#60A5FA"/>
    </Svg>
);

const GovSchemeIcon = () => (
    <Svg width="60" height="60" viewBox="0 0 24 24" fill="none">
        <Path d="M3 21h18M3 10h18M5 10v11M19 10v11M12 4l-9 6h18l-9-6z" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
);

const UpArrowIcon = () => (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <Path d="M12 5l6 6H6l6-6z" fill="#4CAF50"/>
    </Svg>
);

const CameraIcon = () => (
    <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" fill="#ffffff"/>
        <Circle cx="12" cy="13" r="4" fill="#4CAF50"/>
    </Svg>
);


// --- MarketPriceSection Component with Filters ---
const MarketPriceSection = () => {
  const [marketData, setMarketData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [showStateModal, setShowStateModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [states, setStates] = useState(['All States']);
  const [districts, setDistricts] = useState(['All Districts']);

  const API_KEY = "";
  const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
  const API_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=1000`;

  useEffect(() => {
    const fetchMarketPrices = async () => {
      try {
        const response = await fetch(API_URL);
        const json = await response.json();

        const formatted = json.records.map((item, index) => ({
          id: index.toString(),
          name: item.commodity,
          source: item.market,
          price: item.modal_price,
          state: item.state,
          district: item.district,
        }));

        setMarketData(formatted);
        setFilteredData(formatted);

        // Extract unique states and districts
        const uniqueStates = ['All States', ...new Set(formatted.map(item => item.state).filter(Boolean))];
        const uniqueDistricts = ['All Districts', ...new Set(formatted.map(item => item.district).filter(Boolean))];
        
        setStates(uniqueStates);
        setDistricts(uniqueDistricts);
      } catch (error) {
        console.error("Failed to fetch market prices:", error);
        setMarketData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketPrices();
  }, []);

  useEffect(() => {
    filterData();
  }, [selectedState, selectedDistrict, marketData]);

  const filterData = () => {
    let filtered = [...marketData];

    if (selectedState !== 'All States') {
      filtered = filtered.filter(item => item.state === selectedState);
    }

    if (selectedDistrict !== 'All Districts') {
      filtered = filtered.filter(item => item.district === selectedDistrict);
    }

    setFilteredData(filtered.slice(0, 10)); // Limit to 10 items for display
  };

  const handleStateSelect = (state) => {
    setSelectedState(state);
    setShowStateModal(false);
    
    // Reset district when state changes
    if (state === 'All States') {
      setSelectedDistrict('All Districts');
    } else {
      // Update districts based on selected state
      const stateDistricts = ['All Districts', ...new Set(
        marketData
          .filter(item => item.state === state)
          .map(item => item.district)
          .filter(Boolean)
      )];
      setDistricts(stateDistricts);
      setSelectedDistrict('All Districts');
    }
  };

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district);
    setShowDistrictModal(false);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#4CAF50" style={{ marginVertical: 20 }} />;
  }

  return (
    <View>
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowStateModal(true)}
        >
          <FilterIcon />
          <Text style={styles.filterButtonText}>{selectedState}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowDistrictModal(true)}
        >
          <FilterIcon />
          <Text style={styles.filterButtonText}>{selectedDistrict}</Text>
        </TouchableOpacity>
      </View>

      {/* State Selection Modal */}
      <Modal
        visible={showStateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select State</Text>
            <ScrollView style={styles.modalScrollView}>
              {states.map((state, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalItem,
                    selectedState === state && styles.modalItemSelected
                  ]}
                  onPress={() => handleStateSelect(state)}
                >
                  <Text style={[
                    styles.modalItemText,
                    selectedState === state && styles.modalItemTextSelected
                  ]}>
                    {state}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowStateModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* District Selection Modal */}
      <Modal
        visible={showDistrictModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDistrictModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select District</Text>
            <ScrollView style={styles.modalScrollView}>
              {districts.map((district, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalItem,
                    selectedDistrict === district && styles.modalItemSelected
                  ]}
                  onPress={() => handleDistrictSelect(district)}
                >
                  <Text style={[
                    styles.modalItemText,
                    selectedDistrict === district && styles.modalItemTextSelected
                  ]}>
                    {district}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDistrictModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Market Data Display */}
      {filteredData.length === 0 ? (
        <Text style={{ textAlign: 'center', marginVertical: 20 }}>No market data found for selected filters.</Text>
      ) : (
        filteredData.map((item) => (
          <View key={item.id} style={styles.marketCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.commodity}>{item.name}</Text>
              <Text style={styles.market}>{item.source}</Text>
              {item.state && <Text style={styles.location}>{item.district}, {item.state}</Text>}
            </View>
            <Text style={styles.price}>₹ {item.price}/Q</Text>
          </View>
        ))
      )}
    </View>
  );
};


// --- Main App Component ---
export default function HomeScreen({ navigation }) {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initUserId = async () => {
      let id = await AsyncStorage.getItem('userId');
      if (!id) {
        id = uuidv4();
        await AsyncStorage.setItem('userId', id);
      }
      setUserId(id);
    };
    initUserId();
  }, []);

  const handleCameraAndNavigate = async () => {
  try {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert('Permission to access the camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.assets || result.canceled) return;

    const file = result.assets[0];
    const localUri = file.uri;
    const filename = localUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename ?? '');
    const type = match ? `image/${match[1]}` : `image`;

    const formData = new FormData();
    formData.append('file', {
      uri: localUri,
      name: filename,
      type,
    });
    formData.append('user_id', userId);

    setLoading(true);

    const response = await fetch(`${API_URL}/analyze-image/`, {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const data = await response.json();

    setLoading(false);

    // ✅ Navigate after upload
    navigation.navigate('ChatWithBot', {
      imageUri: localUri,
      result: data.result || 'No analysis result.',
      userId,
    });
  } catch (err) {
    console.error('❌ Camera + Upload failed:', err.message);
    alert('❌ Failed to capture or upload image.');
    setLoading(false);
  }
};



  return (
    
    
    
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={require('../assets/logo.png')} style={styles.logo} />
            <Text style={styles.headerTitle}>Krishi Dev</Text>
              <View style={styles.betaBadge}>
                <Text style={styles.betaText}>Beta</Text>
              </View>
            <View style={styles.headerTitleContainer}>
              
            </View>
          </View>
          <Image
            source={require('../assets/profile.png' )}
            style={styles.profileImage}
          />
        </View>



        {/* Weather Card Section */}
        <View style={styles.weatherCard}>
          <View style={styles.weatherTempContainer}>
            <Text style={styles.weatherTemp}>24°c</Text>
            <Text style={styles.weatherHiLo}>High 32°   Low 18°</Text>
          </View>
          <View style={styles.weatherInfoContainer}>
            <SunCloudIcon />
            <View style={styles.weatherLocationContainer}>
                <Text style={styles.weatherLocation}>📍 Bokaro</Text>
                <Text style={styles.weatherCondition}>Mostly Sunny</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons Section - NOW HORIZONTALLY SCROLLABLE */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.actionButtonsScrollView}
          contentContainerStyle={styles.actionButtonsContainer}
        >
          <TouchableOpacity
  style={[styles.actionButton, { backgroundColor: '#dfc5ffff' }]}
  onPress={() => navigation.navigate('ChatWithBot')}
>
  <Image source={require('../assets/technology.png')} style={{ width: 60, height: 60 }} />
  <Text style={styles.actionButtonText}>Ask AI</Text>
</TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#A7C7E7' }]}
          onPress={() => navigation.navigate('News')}>
            <NewsIcon />
            <Text style={styles.actionButtonText}>News</Text>
          </TouchableOpacity>

         <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FDFD96' }]}>
            <GovSchemeIcon />
            <Text style={styles.actionButtonText}>Schemes</Text>
          </TouchableOpacity>
        

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#bdffd0ff' }]}>
            <LoanIcon />
            <Text style={styles.actionButtonText}>Loan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#fe8989ff' }]}>
            <YoutubeIcon />
            <Text style={styles.actionButtonText}>Youtube</Text>
          </TouchableOpacity>
          
         </ScrollView>

         {/* Market Price Section - Using the new MarketPriceSection component */}
        <Text style={styles.marketPriceTitle}>Market Price</Text>
        <View style={styles.marketPriceContainer}>
          <MarketPriceSection />
        </View>

      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCameraAndNavigate}
      >  
        <CameraIcon /> 
      </TouchableOpacity>

      {loading && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: '#2E7D32',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999,
        }}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: '#fff', marginTop: 10 }}>Analyzing image...</Text>
        </View>
      )}

    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#2E7D32',
  },
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  scrollContentContainer: {
    paddingBottom: 100,
  },
  header: {
    
    height: 300,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 60,
    backgroundColor: '#2E7D32',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleContainer: {
    marginLeft: 4,
  },
  headerTitle: {
    marginLeft: -8,
    marginBottom: 120,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  betaBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 0,
    marginTop: 8,
  },
  betaText: {
    color: '#FFFFFF',
    fontSize: 6,
    fontWeight: 'bold',
  },
  profileImage: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 120,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  weatherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: -190,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  weatherTempContainer: {
    alignItems: 'flex-start',
  },
  weatherTemp: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  weatherHiLo: {
    fontSize: 14,
    color: '#666',
  },
  weatherInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherLocationContainer: {
    marginLeft: 10,
    alignItems: 'flex-start',
  },
  weatherLocation: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  weatherCondition: {
    fontSize: 14,
    color: '#666',
  },
  actionButtonsScrollView: {
    marginTop: 20,
    flexGrow: 0,
  },
  actionButtonsContainer: {
    paddingHorizontal: 15,
  },
  actionButton: {
    width: width * 0.3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 20,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  actionButtonText: {
    marginTop: 8,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  marketPriceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  marketPriceContainer: {
    paddingHorizontal: 20,
  },
  // Styles for MarketPriceSection component
  marketCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  commodity: {
    fontSize: 16,
    fontWeight: "600",
  },
  market: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
  location: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    color: "#2e7d32",
    fontWeight: "700",
  },
  // Filter styles
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 10,
  },
    filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 5,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    numberOfLines: 1,
    ellipsizeMode: 'tail',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemSelected: {
    backgroundColor: '#e8f5e9',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalItemTextSelected: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  modalCloseButton: {
    marginTop: 15,
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 25,
    bottom: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  logo: {
    marginBottom: 120,
    width: 50,
    height: 50,
    marginRight: 10,
  },
});
