import { supabase } from "../config/supabaseClient.js";

export const faqModel = {
  // Get all active FAQs (Public - no auth required)
  async getAllFAQs() {
    try {
      console.log('📋 [FAQ Model] Fetching all active FAQs from Supabase');
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [FAQ Model] Supabase error in getAllFAQs:', error);
        throw error;
      }

      console.log(`✅ [FAQ Model] Retrieved ${data?.length || 0} active FAQs`);
      return data || [];
    } catch (error) {
      console.error('❌ [FAQ Model] Error in getAllFAQs:', error);
      throw error;
    }
  },

  // Get FAQ by ID (Public - no auth required)
  async getFAQById(id) {
    try {
      console.log(`🔍 [FAQ Model] Fetching FAQ by ID: ${id}`);
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`❌ [FAQ Model] Supabase error in getFAQById ${id}:`, error);
        throw error;
      }

      console.log(`✅ [FAQ Model] Retrieved FAQ: ${data?.question}`);
      return data;
    } catch (error) {
      console.error(`❌ [FAQ Model] Error in getFAQById ${id}:`, error);
      throw error;
    }
  },

  // Get FAQs by category (Public - no auth required)
  async getFAQsByCategory(category) {
    try {
      console.log(`📂 [FAQ Model] Fetching FAQs by category: ${category}`);
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`❌ [FAQ Model] Supabase error in getFAQsByCategory ${category}:`, error);
        throw error;
      }

      console.log(`✅ [FAQ Model] Retrieved ${data?.length || 0} FAQs in category: ${category}`);
      return data || [];
    } catch (error) {
      console.error(`❌ [FAQ Model] Error in getFAQsByCategory ${category}:`, error);
      throw error;
    }
  },

  // Create new FAQ
  async createFAQ(faqData) {
    try {
      console.log('➕ [FAQ Model] Creating new FAQ in Supabase:', faqData);
      const { data, error } = await supabase
        .from('faqs')
        .insert([
          {
            question: faqData.question,
            answer: faqData.answer,
            category: faqData.category,
            is_active: faqData.is_active !== undefined ? faqData.is_active : true,
            created_by: faqData.created_by
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ [FAQ Model] Supabase error in createFAQ:', error);
        throw error;
      }

      console.log(`✅ [FAQ Model] Created new FAQ: ${data.id}`);
      return data;
    } catch (error) {
      console.error('❌ [FAQ Model] Error in createFAQ:', error);
      throw error;
    }
  },

  // Update FAQ
  async updateFAQ(id, faqData) {
    try {
      console.log(`✏️ [FAQ Model] Updating FAQ ${id}:`, faqData);
      const { data, error } = await supabase
        .from('faqs')
        .update({
          question: faqData.question,
          answer: faqData.answer,
          category: faqData.category,
          is_active: faqData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`❌ [FAQ Model] Supabase error in updateFAQ ${id}:`, error);
        throw error;
      }

      console.log(`✅ [FAQ Model] Updated FAQ: ${id}`);
      return data;
    } catch (error) {
      console.error(`❌ [FAQ Model] Error in updateFAQ ${id}:`, error);
      throw error;
    }
  },

  // Delete FAQ
  async deleteFAQ(id) {
    try {
      console.log(`🗑️ [FAQ Model] Deleting FAQ: ${id}`);
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`❌ [FAQ Model] Supabase error in deleteFAQ ${id}:`, error);
        throw error;
      }

      console.log(`✅ [FAQ Model] Deleted FAQ: ${id}`);
      return { message: 'FAQ deleted successfully' };
    } catch (error) {
      console.error(`❌ [FAQ Model] Error in deleteFAQ ${id}:`, error);
      throw error;
    }
  },

  // Get all FAQs for admin (including inactive)
  async getAllFAQsForAdmin() {
    try {
      console.log('👑 [FAQ Model] Fetching all FAQs for admin from Supabase');
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [FAQ Model] Supabase error in getAllFAQsForAdmin:', error);
        throw error;
      }

      console.log(`✅ [FAQ Model] Retrieved ${data?.length || 0} FAQs for admin`);
      return data || [];
    } catch (error) {
      console.error('❌ [FAQ Model] Error in getAllFAQsForAdmin:', error);
      throw error;
    }
  }
};