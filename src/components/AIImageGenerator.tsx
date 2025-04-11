import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    PermissionsAndroid,
    Linking
} from 'react-native';
import colors from '../utils/colors';
import { STABILITY_API_KEY } from '@env';
import RNFS from 'react-native-fs';
import {
    CameraRoll,

} from '@react-native-camera-roll/camera-roll';

const AIImageGenerator = () => {
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateImage = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(
                'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${STABILITY_API_KEY}`,
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        text_prompts: [{
                            text: prompt,
                            weight: 1.0 // Between 0.1-2.0 (higher = more emphasis)
                        }],
                        cfg_scale: 8, // Creativity (7-12)
                        height: 1024,
                        width: 1024,
                        steps: 30, // Quality (20-50)
                        sampler: "K_DPMPP_2M", // Try "K_EULER" for faster results
                        style_preset: "cinematic" // Try "digital-art" or "fantasy-art"
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const base64Image = data.artifacts[0].base64;
            setImageUrl(`data:image/png;base64,${base64Image}`);
        } catch (err) {
            setError('Failed to generate image. Please try again.');
            console.error('Generation error:', err);
        } finally {
            setLoading(false);
        }
    };

    const downloadImage = async () => {
        try {
            if (Platform.OS === 'android') {
                // Check Android version
                const apiLevel = Platform.Version;

                let permissions;
                if (apiLevel >= 33) { // Android 13+
                    permissions = [
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                    ];
                } else { // Android 10-12
                    permissions = [
                        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    ];
                }

                const granted = await PermissionsAndroid.requestMultiple(permissions);

                const allGranted = Object.values(granted).every(
                    status => status === PermissionsAndroid.RESULTS.GRANTED
                );

                if (!allGranted) {
                    Alert.alert(
                        'Permission Needed',
                        'Please allow media access to save images',
                        [
                            {
                                text: 'Open Settings',
                                onPress: () => Linking.openSettings()
                            },
                            { text: 'Cancel' }
                        ]
                    );
                    return;
                }
            }

            // Save image implementation
            const timestamp = new Date().getTime();
            const fileName = `AI_Image_${timestamp}.jpg`;
            const base64Data = imageUrl.split(',')[1];

            if (Platform.OS === 'android') {
                const filePath = `${RNFS.PicturesDirectoryPath}/${fileName}`;
                await RNFS.writeFile(filePath, base64Data, 'base64');
                await CameraRoll.save(`file://${filePath}`, { type: 'photo' });
            } else {
                const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
                await RNFS.writeFile(filePath, base64Data, 'base64');
                await CameraRoll.save(`file://${filePath}`, { type: 'photo' });
            }

            Alert.alert('Success', 'Image saved to gallery!');

        } catch (error) {
            console.error('Save failed:', error);
            Alert.alert('Error', 'Failed to save image. Please try again.');
        }
    };


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>
                    <Text style={styles.title}>AI Image Generator</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Describe the image you want..."
                        placeholderTextColor={colors.placeholder}
                        value={prompt}
                        onChangeText={setPrompt}
                        multiline
                        scrollEnabled={false} // Let ScrollView handle scrolling
                    />

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    <TouchableOpacity
                        style={styles.button}
                        onPress={generateImage}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.buttonText}>Generate Image</Text>
                        )}
                    </TouchableOpacity>

                    {imageUrl ? (
                        <View style={styles.imageWrapper}>
                            <Image
                                source={{ uri: imageUrl }}
                                style={styles.image}
                                resizeMode="contain"
                            />
                            <TouchableOpacity
                                style={styles.downloadButton}
                                onPress={downloadImage}
                            >
                                <Text style={styles.downloadButtonText}>↓</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

// Keep your existing styles
const styles = StyleSheet.create({

    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20, // Add some bottom padding
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: colors.background,
    },
    // ... (keep all your existing styles) ...
    input: {
        backgroundColor: colors.inputBg,
        color: colors.text,
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
        minHeight: 100,
        maxHeight: 200, // Limit maximum height before scrolling
        textAlignVertical: 'top',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: colors.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    image: {
        width: '100%',
        height: 300,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.inputBg,
    },
    error: {
        color: colors.error,
        marginBottom: 15,
        textAlign: 'center',
    },

    imageWrapper: {
        position: 'relative',
    },
    downloadButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: colors.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.8,
    },
    downloadButtonText: {
        color: colors.white,
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default AIImageGenerator;