import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { launchCamera } from 'react-native-image-picker';

function ScanScreen() {
  const [photo, setPhoto] = React.useState<string | null>(null);

  const takePhoto = () => {
    launchCamera({
      mediaType: 'photo',
      includeBase64: false, // set to true if you need base64 for backend
      quality: 0.8,  // 0-1 scale
    }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled');
      } else if (response.errorCode) {
        console.log('Error: ', response.errorMessage);
      } else {
        if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
          setPhoto(response.assets[0].uri);  // the photo URI for display/upload
        } else {
          setPhoto(null);
        }
        // Tomorrow: send to backend for nutrition analysis
      }
    });
  };

  return (
    <View style={styles.container}>
      {photo ? (
        <Image source={{ uri: photo }} style={styles.photo} />
      ) : (
        <Text style={styles.text}>Ready to scan food</Text>
      )}
      <TouchableOpacity style={styles.button} onPress={takePhoto}>
        <Text style={styles.buttonText}>Take Photo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 24, color: '#333' },
  button: { backgroundColor: '#4CAF50', padding: 20, borderRadius: 30, marginTop: 20 },
  buttonText: { color: 'white', fontSize: 20 },
  photo: { width: 300, height: 300, marginBottom: 20 },
});

export default ScanScreen;