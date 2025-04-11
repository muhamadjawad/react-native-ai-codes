import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import colors from '../utils/colors';
import { STABILITY_API_KEY } from '@env';

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
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.image}
                            resizeMode="contain"
                        />
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
});

export default AIImageGenerator;