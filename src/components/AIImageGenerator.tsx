import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
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
                        text_prompts: [{ text: prompt }],
                        cfg_scale: 7,
                        height: 1024,
                        width: 1024,
                        steps: 30,
                        samples: 1,
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
        <View style={styles.container}>
            <Text style={styles.title}>AI Image Generator</Text>

            <TextInput
                style={styles.input}
                placeholder="Describe the image you want..."
                placeholderTextColor={colors.placeholder}
                value={prompt}
                onChangeText={setPrompt}
                multiline
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
    );
};

// Keep your existing styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: colors.background,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: colors.inputBg,
        color: colors.text,
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: 'top',
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