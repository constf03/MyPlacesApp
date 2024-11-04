import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {Dialog} from 'react-native-simple-dialogs';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

function App() {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [places, setPlaces] = useState([]);

  const saveMyPlaceData = async () => {
    try {
      await AsyncStorage.setItem('@places', JSON.stringify(places));
    } catch (e) {
      console.log('Error saving MyPlaces!');
    }
  };

  const loadSavedMyPlaces = async () => {
    try {
      const value = await AsyncStorage.getItem('@places');
      if (value !== null) {
        setPlaces(JSON.parse(value));
      }
    } catch (error) {
      console.log('Error loading MyPlaces!');
      console.log(error);
    }
  };

  // load cities on start
  useEffect(() => {
    loadSavedMyPlaces();
  }, []);

  // save cities on state change
  useEffect(() => {
    saveMyPlaceData();
  }, [places]);

  const Banner = () => {
    return (
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'skyblue',
          padding: 10,
        }}>
        <Text style={{fontSize: 24, fontWeight: 'bold', color: 'white'}}>
          MyPlaces
        </Text>
      </View>
    );
  };

  const MyPlaceButton = () => {
    const showDialog = () => {
      setDialogVisible(true);
    };
    return (
      <TouchableOpacity
        style={{
          position: 'absolute',
          right: 15,
          bottom: 15,
          borderRadius: 60,
          width: 60,
          alignItems: 'center',
          elevation: 2,
          padding: 10,
          backgroundColor: 'green',
        }}
        onPress={showDialog}>
        <Text style={{fontSize: 28, color: 'white', fontWeight: 'bold'}}>
          +
        </Text>
      </TouchableOpacity>
    );
  };

  const MyPlace = () => {
    const [placeName, setPlaceName] = useState('');
    const [placeDesc, setPlaceDesc] = useState('');

    const addMyPlace = async () => {
      try {
        const API_URL = `https://nominatim.openstreetmap.org/search?city=${placeName}&format=json&limit=1`;
        const response = await axios.get(API_URL);

        if (response.data && response.data.length > 0) {
          const placeData = response.data[0];

          setPlaces([
            ...places,
            {
              id: placeData.place_id,
              lat: parseFloat(placeData.lat),
              lon: parseFloat(placeData.lon),
              title: placeName,
              description: placeDesc,
            },
          ]);
          setDialogVisible(false);
        } else {
          console.error('No results found for the given city.');
        }
      } catch (error) {
        console.error('Error fetching the city data:', error);
      }
    };

    return (
      <View style={{display: 'flex', flexDirection: 'column', gap: 20}}>
        <View style={{display: 'flex', flexDirection: 'column', gap: 6}}>
          <TextInput
            autoCapitalize
            placeholder="City"
            value={placeName}
            onChangeText={e => setPlaceName(e)}
            style={{padding: 5, backgroundColor: 'skyblue', color: 'white'}}
          />
          <TextInput
            autoCapitalize
            placeholder="Description"
            value={placeDesc}
            onChangeText={e => setPlaceDesc(e)}
            style={{padding: 5, backgroundColor: 'skyblue', color: 'white'}}
          />
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity
            onPress={() => setDialogVisible(false)}
            style={{
              padding: 5,
              width: 60,
              backgroundColor: 'crimson',
              alignItems: 'center',
            }}>
            <Text style={{color: 'white'}}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={addMyPlace}
            style={{
              padding: 5,
              width: 60,
              backgroundColor: 'green',
              alignItems: 'center',
            }}>
            <Text style={{color: 'white', fontWeight: 'bold'}}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const INITIAL_REGION = {
    latitude: 62.242561,
    longitude: 25.747499,
    latitudeDelta: 2,
    longitudeDelta: 2,
  };

  return (
    <View style={{flex: 1}}>
      <Banner />
      <MapView
        style={{flex: 1}}
        zoomEnabled={true}
        initialRegion={INITIAL_REGION}
        provider={PROVIDER_GOOGLE}>
        {places.map((place, index) => (
          <Marker
            key={index}
            coordinate={{latitude: place.lat, longitude: place.lon}}
            pinColor={'red'}
            title={place.title}
            description={place.description}
          />
        ))}
      </MapView>
      <MyPlaceButton />
      <Dialog
        visible={dialogVisible}
        title="Add a new MyPlace"
        onTouchOutside={() => setDialogVisible(false)}
        animationType="fade">
        <View>
          <MyPlace />
        </View>
      </Dialog>
    </View>
  );
}

const styles = StyleSheet.create({});

export default App;
