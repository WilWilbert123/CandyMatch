import { Audio } from 'expo-av';
import { useEffect, useRef } from 'react';

export const useSound = () => {
  const flipSound = useRef(null);
  const matchSound = useRef(null);
  const winSound = useRef(null);

  useEffect(() => {
    const loadSounds = async () => {
      try {
        flipSound.current = new Audio.Sound();
        await flipSound.current.loadAsync(require('../../assets/sounds/flip.mp3'));
        
        matchSound.current = new Audio.Sound();
        await matchSound.current.loadAsync(require('../../assets/sounds/match.mp3'));
        
        winSound.current = new Audio.Sound();
        await winSound.current.loadAsync(require('../../assets/sounds/win.mp3'));
        
        console.log('✅ Sounds loaded successfully!');
      } catch (error) {
        console.log('⚠️ Sound loading error:', error.message);
      }
    };
    
    loadSounds();
    
    return () => {
      if (flipSound.current) flipSound.current.unloadAsync();
      if (matchSound.current) matchSound.current.unloadAsync();
      if (winSound.current) winSound.current.unloadAsync();
    };
  }, []);

  const playFlip = async () => {
    try {
      if (flipSound.current) {
        await flipSound.current.replayAsync();
        console.log('🔊 Flip sound played');
      }
    } catch (error) {
      console.log('Flip sound error:', error.message);
    }
  };

  const playMatch = async () => {
    try {
      if (matchSound.current) {
        await matchSound.current.replayAsync();
        console.log('🔊 Match sound played');
      }
    } catch (error) {
      console.log('Match sound error:', error.message);
    }
  };

  const playWin = async () => {
    try {
      if (winSound.current) {
        await winSound.current.replayAsync();
        console.log('🔊 Win sound played');
      }
    } catch (error) {
      console.log('Win sound error:', error.message);
    }
  };

  return { playFlip, playMatch, playWin };
};