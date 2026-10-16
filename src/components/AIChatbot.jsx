import React, { useState, useEffect, useRef } from 'react'
import {
  MessageSquare,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  Globe,
  CornerDownLeft,
  ChevronDown,
  Layers,
  Thermometer,
  CloudRain,
  Wind,
  MapPin
} from 'lucide-react'
import { processAIChat, I18N } from '../services/aiChatbot'
import { formatTemp } from '../services/weatherApi'

export default function AIChatbot({ currentWeather, unit = 'C', onSelectCity }) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [language, setLanguage] = useState('en')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(false)

  const activeCityName = currentWeather?.city?.name
  const activeTempStr = currentWeather?.list?.[0] ? formatTemp(currentWeather.list[0].main.temp, unit) : ''

  // Generate dynamic location-based suggestions
  const getLocationSuggestions = (cityName) => {
    if (!cityName) return (I18N[language] || I18N.en).suggestions
    return [
      `☂️ Umbrella in ${cityName}?`,
      `👕 What to wear in ${cityName}?`,
      `🏃 Workout in ${cityName}?`,
      `🍃 Air quality in ${cityName}`,
      `📅 7-day forecast for ${cityName}`,
      `⚡ Alerts in ${cityName}`,
      `✈️ Travel advice for ${cityName}`
    ]
  }

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: I18N.en.greeting,
      cards: [],
      followUps: I18N.en.suggestions
    }
  ])

  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const lastCityRef = useRef(null)

  // React to searched location changes dynamically
  useEffect(() => {
    if (!currentWeather || !currentWeather.city || !currentWeather.list?.[0]) return
    const cityName = currentWeather.city.name

    // If city changed or first load of search location
    if (lastCityRef.current !== cityName) {
      lastCityRef.current = cityName
      const cur = currentWeather.list[0]
      const tempStr = formatTemp(cur.main.temp, unit)
      const feelsStr = formatTemp(cur.main.feels_like, unit)
      const desc = cur.weather[0].description
      const isRainy = currentWeather.recommendations?.umbrella?.needed
      const rainProb = cur.rainProbability ?? 0

      const proactiveMsg = {
        id: Date.now(),
        sender: 'bot',
        text: `📍 **Live telemetry synchronized for ${cityName}!**\n\nCurrently **${tempStr}** (feels like **${feelsStr}**) with **${desc}**.\n${
          isRainy
            ? `☔ **Umbrella advised**: Rain chance is around ${rainProb}%.`
            : `☀️ **Clear skies**: No umbrella required right now.`
        }\n\nAsk me about clothing, running conditions, air quality, or weekend forecasts for **${cityName}**!`,
        cards: [currentWeather],
        followUps: getLocationSuggestions(cityName)
      }

      setMessages((prev) => [...prev, proactiveMsg])
    }
  }, [currentWeather?.city?.name, unit])

  // Scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isTyping])

  // Update greeting when language changes
  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    const langObj = I18N[lang] || I18N.en
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'bot',
        text: langObj.greeting,
        cards: [],
        followUps: getLocationSuggestions(activeCityName)
      }
    ])
  }

  // Text to Speech
  const speakText = (text) => {
    if (!ttsEnabled || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const cleanText = text.replace(/[*_#•]/g, '')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = 1.05
    utterance.pitch = 1.0
    if (language === 'es') utterance.lang = 'es-ES'
    else if (language === 'fr') utterance.lang = 'fr-FR'
    else if (language === 'de') utterance.lang = 'de-DE'
    else if (language === 'hi') utterance.lang = 'hi-IN'
    else if (language === 'ja') utterance.lang = 'ja-JP'
    else utterance.lang = 'en-US'

    window.speechSynthesis.speak(utterance)
  }

  // Speech Recognition (Voice Input)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser. Please try Google Chrome or Edge.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false

      if (language === 'es') recognition.lang = 'es-ES'
      else if (language === 'fr') recognition.lang = 'fr-FR'
      else if (language === 'de') recognition.lang = 'de-DE'
      else if (language === 'hi') recognition.lang = 'hi-IN'
      else if (language === 'ja') recognition.lang = 'ja-JP'
      else recognition.lang = 'en-US'

      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onerror = () => setIsListening(false)
      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript
        setInput(transcript)
        handleSend(transcript)
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      console.warn('Speech recognition error:', err)
      setIsListening(false)
    }
  }

  // Send message
  const handleSend = async (customText) => {
    const queryText = (customText || input).trim()
    if (!queryText) return

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: queryText
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const response = await processAIChat({
        message: queryText,
        currentWeather,
        unit,
        language
      })

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.text,
        cards: response.cards || [],
        followUps: response.followUps || getLocationSuggestions(activeCityName)
      }

      setMessages((prev) => [...prev, botMsg])
      speakText(response.text)
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: "I encountered a minor atmospheric interference. Please check your query or internet connection.",
          cards: [],
          followUps: getLocationSuggestions(activeCityName)
        }
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 text-gray-950 font-bold px-4 py-3.5 rounded-full shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:shadow-[0_0_35px_rgba(6,182,212,0.9)] hover:scale-105 active:scale-95 transition-all duration-300 border border-white/40 backdrop-blur-md cursor-pointer"
            aria-label="Open ZenAI Weather Chatbot"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <Bot size={22} className="text-gray-950" />
            <div className="hidden sm:flex flex-col text-left pr-1 leading-tight">
              <span className="font-bold tracking-wide text-xs text-gray-950">
                ZenAI Weather Copilot
              </span>
              {activeCityName && (
                <span className="text-[10px] text-cyan-950 font-semibold flex items-center gap-0.5">
                  <MapPin size={9} /> {activeCityName} ({activeTempStr})
                </span>
              )}
            </div>
          </button>
        )}

        {/* Floating Chat Modal */}
        {isOpen && (
          <div className="w-[94vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-[#0c1427]/90 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-5 py-3.5 bg-white/10 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-gray-950 shadow-md">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold text-sm tracking-wide">
                      ZenAI Intelligence
                    </span>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <span className="text-cyan-300 text-[11px] font-medium opacity-90 flex items-center gap-1">
                    {activeCityName ? (
                      <>
                        <MapPin size={10} /> Active: {activeCityName} ({activeTempStr})
                      </>
                    ) : (
                      'Live Open-Meteo Copilot'
                    )}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1 text-white/80">
                {/* Language Select */}
                <div className="relative flex items-center mr-1">
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="bg-black/40 text-cyan-200 text-xs px-2 py-1 rounded-lg border border-white/20 focus:outline-none cursor-pointer"
                    title="Select Language"
                  >
                    <option value="en">English (EN)</option>
                    <option value="es">Español (ES)</option>
                    <option value="fr">Français (FR)</option>
                    <option value="de">Deutsch (DE)</option>
                    <option value="hi">हिन्दी (HI)</option>
                    <option value="ja">日本語 (JA)</option>
                  </select>
                </div>

                {/* Text to Speech Toggle */}
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                    ttsEnabled ? 'text-cyan-400 bg-white/10' : 'text-white/60'
                  }`}
                  title={ttsEnabled ? 'Mute Speech' : 'Enable Speech Output'}
                >
                  {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors ml-1 cursor-pointer"
                  title="Close ZenAI"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md rounded-tr-none'
                        : 'bg-white/15 text-white backdrop-blur-md border border-white/15 shadow-md rounded-tl-none whitespace-pre-line'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Embedded Rich Weather Cards if present */}
                  {msg.cards && msg.cards.length > 0 && (
                    <div className="w-full mt-2 space-y-2">
                      {msg.cards.map((card, idx) => {
                        const curW = card.list[0]
                        return (
                          <div
                            key={idx}
                            onClick={() => onSelectCity && onSelectCity(card.city.name)}
                            className="bg-black/40 border border-cyan-400/30 rounded-xl p-3 text-white flex items-center justify-between hover:bg-black/60 transition-colors cursor-pointer group"
                            title="Click to view on Dashboard"
                          >
                            <div>
                              <p className="font-bold text-sm text-cyan-300 group-hover:text-cyan-200">
                                {card.city.name}, {card.city.country}
                              </p>
                              <p className="text-xs text-white/70 capitalize">
                                {curW.weather[0].description} • Rain: {curW.rainProbability ?? 0}%
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-black text-white">
                                {formatTemp(curW.main.temp, unit)}
                              </p>
                              <p className="text-[11px] text-white/60">
                                {formatTemp(curW.main.temp_max, unit)} / {formatTemp(curW.main.temp_min, unit)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Follow-up Suggestion Chips */}
                  {msg.followUps && msg.followUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-full">
                      {msg.followUps.map((chip, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(chip)}
                          className="text-[11px] bg-white/10 hover:bg-cyan-500/30 border border-white/20 hover:border-cyan-400/50 text-cyan-200 px-2.5 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-1.5 bg-white/15 text-white/70 px-4 py-2.5 rounded-2xl w-fit backdrop-blur-md border border-white/10">
                  <span className="text-xs font-medium text-cyan-300">ZenAI is analyzing microclimate</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Location-Aware Quick Suggestions Bar */}
            <div className="px-3 py-1.5 bg-black/40 border-t border-white/10 flex gap-2 overflow-x-auto no-scrollbar">
              {getLocationSuggestions(activeCityName).map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(sug)}
                  className="text-[11px] bg-white/10 hover:bg-cyan-400/20 text-white/80 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 whitespace-nowrap transition-colors cursor-pointer shrink-0"
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <div className="p-3 bg-white/5 border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                placeholder={
                  isListening
                    ? 'Listening to voice...'
                    : activeCityName
                    ? `Ask ZenAI about ${activeCityName} or any city...`
                    : 'Ask ZenAI anything about the weather...'
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend()
                }}
                className="flex-1 bg-white/10 text-white placeholder-white/50 text-sm px-4 py-2.5 rounded-xl border border-white/20 focus:outline-none focus:border-cyan-400 transition-colors"
              />

              {/* Voice Input Mic Button */}
              <button
                onClick={toggleSpeechRecognition}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white border-red-400 animate-pulse'
                    : 'bg-white/10 text-white/80 hover:text-white border-white/20 hover:bg-white/20'
                }`}
                title={isListening ? 'Stop Listening' : 'Voice Input'}
              >
                {isListening ? <MicOff size={17} /> : <Mic size={17} />}
              </button>

              {/* Send Button */}
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="p-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-gray-950 font-bold transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
                title="Send Message"
              >
                <Send size={17} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
