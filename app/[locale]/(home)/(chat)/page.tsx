'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from 'ai/react';
import { useAtom } from 'jotai';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { AddButton } from '@/components/layout/add-button';
import { ConversationWindow } from '@/components/layout/chat/conversation-window';
import { InputBox } from '@/components/layout/chat/input-box';
import { ModelSelect } from '@/components/layout/model-select';
import { ShareButton } from '@/components/layout/share-button';
import { getLocalStorage } from '@/hooks/storage';
import store from '@/hooks/store';
import { ApiConfig } from '@/types/app';
import { Conversation } from '@/types/conversation';
import { ProviderSetting, SpecifiedProviderSetting } from '@/types/settings';
import { generateUUID } from '@/utils/app/uuid';

export default function MiloWayfinder() {
    const searchParams = useSearchParams();

    const router = useRouter();

    const inputRef = useRef<HTMLTextAreaElement>(null);

    const chat = searchParams.get('chat');

    const prevChatRef = useRef<string | null>();

    useEffect(() => {
        prevChatRef.current = chat!;
    });

    const prevChat = prevChatRef.current;

    const t = useTranslations('');

    const [currentConversationUUID, setCurrentConversationUUID] = useState<string>();

    const [currentUseModel] = useAtom(store.currentUseModelAtom);
    const [advancedSettings] = useAtom(store.advancedSettingsAtom);
    const [conversationSettings] = useAtom(store.conversationSettingsAtom);

    const [conversations, setConversations] = useAtom(store.conversationsAtom);

    const [currentProviderSettings] = useAtom<ProviderSetting | null>(store.currentProviderSettingsAtom);

    const { messages, setMessages, isLoading, input, handleInputChange, handleSubmit, stop } = useChat({
        initialInput: `You are Milo Wayfinder, an AI career mentor who helps people find their dream jobs. You provide strategic guidance, company recommendations, and actionable steps. Always respond with empathy and practical advice.`,
        api: advancedSettings.unifiedEndpoint ? '/api/chat/messages' : `/api/chat/messages/${currentUseModel.provider.toString().toLowerCase()}`,
        body: {
            uuid: currentConversationUUID,
            config: {
                provider: currentProviderSettings?.[currentUseModel.provider.toString() as keyof ProviderSetting] as SpecifiedProviderSetting,
                model: currentUseModel,
                stream: advancedSettings.streamMessages,
                numberOfContext: conversationSettings.numOfContext,
            } satisfies ApiConfig,
        },
    });

    const handleSubmitChat = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        handleSubmit(e);
    };

    const handleStop = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        stop();
    };

    const checkIfConversationExists = (uuid: string) => conversations?.find((conversation: Conversation) => conversation.id === uuid);

    const updateConversation = (uuid: string) => {
        const index = conversations?.findIndex((conversation: Conversation) => conversation.id === uuid);
        if (index !== -1 && conversations) {
            const updatedConversations = [...conversations];
            updatedConversations[index!].conversation = messages;
            updatedConversations[index!].updatedAt = new Date().toISOString();

            setConversations(updatedConversations);
        }
    };

    const appendConversation = (conversation: Conversation) => {
        if (messages.length == 0) {
            return;
        }

        const previousConversations = getLocalStorage('conversations');

        const updatedConversations = previousConversations ? [...previousConversations, conversation] : [conversation];

        setConversations(updatedConversations);
    };

    useEffect(() => {
        if (chat && chat !== prevChat) {
            setCurrentConversationUUID(chat);

            const conversation = checkIfConversationExists(chat);

            setMessages(conversation?.conversation || []);

            if (conversation) {
                updateConversation(chat);
            }
        } else {
            if (!currentConversationUUID) {
                setCurrentConversationUUID(generateUUID());
            }

            if (currentConversationUUID && messages.length > 0) {
                const conversationExists = checkIfConversationExists(currentConversationUUID);

                if (conversationExists) {
                    updateConversation(currentConversationUUID);
                } else {
                    appendConversation({
                        id: currentConversationUUID,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        conversation: messages,
                    });
                }
            }
        }
    }, [chat, currentConversationUUID, messages, prevChat]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <>
            <div className='flex items-center justify-between rounded-md bg-transparent'>
                <div className='flex items-center space-x-1 p-2'>
                    <AddButton />
                    <ModelSelect />
                </div>
                <div className='flex items-center space-x-1 p-2'>
                    <ShareButton />
                </div>
            </div>
            {messages.length > 0 ? (
                <div id={currentConversationUUID} className='mx-auto my-10 w-full flex-1 overflow-auto'>
                    <ConversationWindow messages={messages} isLoading={isLoading} />
                </div>
            ) : (
                <div className='flex size-full items-center justify-center'>
                    <div className='text-center'>
                        <h2 className='text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2'>
                            What's your dream job?
                        </h2>
                        <p className='text-lg text-gray-600 dark:text-gray-400'>
                            Tell me what makes you come alive. I'll help you find the path to get there.
                        </p>
                    </div>
                </div>
            )}
            <InputBox inputRef={inputRef} loading={isLoading} input={input} handleInput={handleInputChange} handleSubmit={handleSubmitChat} handleStop={handleStop} />
        </>
    );
}
