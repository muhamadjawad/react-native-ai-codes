// src/components/OpenAIComponent.tsx
import React, { useState, useRef } from 'react';
import { View, Text, Button, TextInput, StyleSheet, ScrollView } from 'react-native';
import { fetchGroqResponse } from '../utils/openAI';

// Color Constants
const COLORS = {
    primary: '#5D9CEC',        // Softer sky blue
    secondary: '#A0D1FB',      // Lighter blue
    background: '#F5F9FF',     // Very light blue background
    surface: '#FFFFFF',        // White containers
    text: '#2D3748',          // Dark gray text
    textLight: '#718096',      // Gray text
    border: '#E2E8F0',        // Light gray border
    inputBg: '#EDF2F7',       // Light gray-blue input
    aiBubble: '#EBF5FF',      // Very light blue for AI
    userBubble: '#5D9CEC',    // Primary color for user
    placeholder: '#A0AEC0',   // Gray placeholder
};

interface ChatMessage {
    text: string;
    timestamp: string;
    isUser: boolean;
}

const AIResponseGenerator = () => {
    const [prompt, setPrompt] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const scrollViewRef = useRef<ScrollView>(null);

    const handleFetchResponse = async () => {
        if (!prompt.trim()) return;

        const userMessage: ChatMessage = {
            text: prompt,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isUser: true
        };

        setChatHistory(prev => [...prev, userMessage]);

        const aiResponse = await fetchGroqResponse(prompt);
        const aiMessage: ChatMessage = {
            text: aiResponse,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isUser: false
        };

        setChatHistory(prev => [...prev, aiMessage]);
        setPrompt('');

        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    return (
        <View style={styles.container}>
            {/* Conversation History */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.historyContainer}
                contentContainerStyle={styles.scrollContent}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {chatHistory.length === 0 ? (
                    <Text style={styles.placeholderText}>Type a message to start chatting...</Text>
                ) : (
                    chatHistory.map((message, index) => (
                        <View
                            key={index}
                            style={[
                                styles.messageContainer,
                                message.isUser ? styles.userContainer : styles.aiContainer
                            ]}
                        >
                            <View style={[
                                styles.messageBubble,
                                message.isUser ? styles.userBubble : styles.aiBubble
                            ]}>
                                <Text style={styles.messageText}>{message.text}</Text>
                            </View>
                            <Text style={styles.timestamp}>
                                {message.timestamp} {message.isUser ? '• You' : '• AI'}
                            </Text>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Input Area */}
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    placeholder="Type your message..."
                    placeholderTextColor={COLORS.placeholder}
                    value={prompt}
                    onChangeText={setPrompt}
                    multiline
                    onSubmitEditing={handleFetchResponse}
                />
                <View style={styles.buttonWrapper}>
                    <Button
                        title="Send"
                        onPress={handleFetchResponse}
                        // color={COLORS.surface}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 16,
    },
    historyContainer: {
        flex: 1,
        marginBottom: 16,
    },
    scrollContent: {
        paddingBottom: 16,
    },
    messageContainer: {
        width: '100%',
        marginBottom: 12,
    },
    aiContainer: {
        alignItems: 'flex-start',
    },
    userContainer: {
        alignItems: 'flex-end',
    },
    messageBubble: {
        borderRadius: 12,
        padding: 16,
        maxWidth: '90%',
    },
    aiBubble: {
        backgroundColor: COLORS.aiBubble,
        borderTopLeftRadius: 0,
    },
    userBubble: {
        backgroundColor: COLORS.userBubble,
        borderTopRightRadius: 0,
    },
    messageText: {
        fontSize: 16,
        color: COLORS.text,
        lineHeight: 22,
    },
    timestamp: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 4,
        marginHorizontal: 8,
    },
    placeholderText: {
        fontSize: 16,
        color: COLORS.placeholder,
        textAlign: 'center',
        marginTop: 24,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.inputBg,
        borderRadius: 12,
        padding: 16,
        fontSize: 14,
        minHeight: 60,
        maxHeight: 120,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: 12,
    },
    buttonWrapper: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        overflow: 'hidden',
        height: 50,
        justifyContent: 'center',
    },
});

export default AIResponseGenerator;