'use client'

import { account } from '@/lib/appwrite/client'

export type ThemePreference = 'light' | 'dark' | 'system'

interface Prefs {
  [key: string]: any
}

/**
 * Get theme preference from Appwrite
 * Returns 'light', 'dark', or 'system' (default: 'system')
 */
export async function getThemePreference(): Promise<ThemePreference> {
  try {
    const user = await account.get()
    if (!user || !user.prefs) {
      return 'system'
    }

    const theme = user.prefs.theme
    if (theme === 'light' || theme === 'dark' || theme === 'system') {
      return theme
    }

    return 'system'
  } catch (error) {
    console.error('Error getting theme preference:', error)
    return 'system'
  }
}

/**
 * Set theme preference in Appwrite
 * IMPORTANT: Only updates the theme pref, preserves all other prefs
 */
export async function setThemePreference(theme: ThemePreference): Promise<boolean> {
  try {
    const user = await account.get()
    if (!user) {
      console.error('No user found')
      return false
    }

    // Get current prefs
    const currentPrefs: Prefs = user.prefs || {}

    // Only update the theme key, preserve everything else
    const updatedPrefs = {
      ...currentPrefs,
      theme,
    }

    // Update account with merged prefs
    await account.updatePrefs(updatedPrefs)
    return true
  } catch (error) {
    console.error('Error setting theme preference:', error)
    return false
  }
}
