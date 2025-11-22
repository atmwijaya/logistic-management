import { faqModel } from '../models/faqModel.js';

export const faqController = {
  // Get all active FAQs (Public - no auth required)
  async getFAQs(req, res) {
    try {
      console.log('📋 [FAQ Controller] Fetching all active FAQs');
      const faqs = await faqModel.getAllFAQs();
      
      console.log(`✅ [FAQ Controller] Successfully retrieved ${faqs.length} FAQs`);
      
      res.json({
        success: true,
        data: faqs,
        message: 'FAQs retrieved successfully',
        count: faqs.length
      });
    } catch (error) {
      console.error('❌ [FAQ Controller] Error in getFAQs:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving FAQs',
        error: error.message
      });
    }
  },

  // Get FAQ by ID (Public - no auth required)
  async getFAQById(req, res) {
    try {
      const { id } = req.params;
      console.log(`🔍 [FAQ Controller] Fetching FAQ by ID: ${id}`);
      
      const faq = await faqModel.getFAQById(id);
      
      if (!faq) {
        return res.status(404).json({
          success: false,
          message: 'FAQ not found'
        });
      }

      console.log(`✅ [FAQ Controller] Successfully retrieved FAQ: ${faq.question}`);
      
      res.json({
        success: true,
        data: faq,
        message: 'FAQ retrieved successfully'
      });
    } catch (error) {
      console.error(`❌ [FAQ Controller] Error in getFAQById ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving FAQ',
        error: error.message
      });
    }
  },

  // Get FAQs by category (Public - no auth required)
  async getFAQsByCategory(req, res) {
    try {
      const { category } = req.params;
      console.log(`📂 [FAQ Controller] Fetching FAQs by category: ${category}`);
      
      const faqs = await faqModel.getFAQsByCategory(category);
      
      console.log(`✅ [FAQ Controller] Successfully retrieved ${faqs.length} FAQs in category: ${category}`);
      
      res.json({
        success: true,
        data: faqs,
        message: 'FAQs retrieved successfully',
        count: faqs.length
      });
    } catch (error) {
      console.error(`❌ [FAQ Controller] Error in getFAQsByCategory ${req.params.category}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving FAQs by category',
        error: error.message
      });
    }
  },

  // Create new FAQ (Admin only)
  async createFAQ(req, res) {
    try {
      const { question, answer, category, is_active } = req.body;
      console.log('➕ [FAQ Controller] Creating new FAQ:', { question, category });
      
      // Validation
      if (!question || !answer) {
        return res.status(400).json({
          success: false,
          message: 'Question and answer are required'
        });
      }

      if (question.length > 500) {
        return res.status(400).json({
          success: false,
          message: 'Question must be less than 500 characters'
        });
      }

      if (answer.length > 2000) {
        return res.status(400).json({
          success: false,
          message: 'Answer must be less than 2000 characters'
        });
      }

      const faqData = {
        question: question.trim(),
        answer: answer.trim(),
        category: category || 'General',
        is_active: is_active !== undefined ? is_active : true,
        created_by: 'admin' // Temporary, until auth is implemented
      };

      const newFAQ = await faqModel.createFAQ(faqData);

      console.log(`✅ [FAQ Controller] Successfully created FAQ: ${newFAQ.id}`);
      
      res.status(201).json({
        success: true,
        data: newFAQ,
        message: 'FAQ created successfully'
      });
    } catch (error) {
      console.error('❌ [FAQ Controller] Error in createFAQ:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating FAQ',
        error: error.message
      });
    }
  },

  // Update FAQ (Admin only)
  async updateFAQ(req, res) {
    try {
      const { id } = req.params;
      const { question, answer, category, is_active } = req.body;
      console.log(`✏️ [FAQ Controller] Updating FAQ ${id}:`, { question, category });

      // Check if FAQ exists
      const existingFAQ = await faqModel.getFAQById(id);
      if (!existingFAQ) {
        return res.status(404).json({
          success: false,
          message: 'FAQ not found'
        });
      }

      // Validation
      if (question && question.length > 500) {
        return res.status(400).json({
          success: false,
          message: 'Question must be less than 500 characters'
        });
      }

      if (answer && answer.length > 2000) {
        return res.status(400).json({
          success: false,
          message: 'Answer must be less than 2000 characters'
        });
      }

      const updateData = {
        question: question || existingFAQ.question,
        answer: answer || existingFAQ.answer,
        category: category || existingFAQ.category,
        is_active: is_active !== undefined ? is_active : existingFAQ.is_active
      };

      const updatedFAQ = await faqModel.updateFAQ(id, updateData);

      console.log(`✅ [FAQ Controller] Successfully updated FAQ: ${id}`);
      
      res.json({
        success: true,
        data: updatedFAQ,
        message: 'FAQ updated successfully'
      });
    } catch (error) {
      console.error(`❌ [FAQ Controller] Error in updateFAQ ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error updating FAQ',
        error: error.message
      });
    }
  },

  // Delete FAQ (Admin only)
  async deleteFAQ(req, res) {
    try {
      const { id } = req.params;
      console.log(`🗑️ [FAQ Controller] Deleting FAQ: ${id}`);

      // Check if FAQ exists
      const existingFAQ = await faqModel.getFAQById(id);
      if (!existingFAQ) {
        return res.status(404).json({
          success: false,
          message: 'FAQ not found'
        });
      }

      await faqModel.deleteFAQ(id);

      console.log(`✅ [FAQ Controller] Successfully deleted FAQ: ${id}`);
      
      res.json({
        success: true,
        message: 'FAQ deleted successfully'
      });
    } catch (error) {
      console.error(`❌ [FAQ Controller] Error in deleteFAQ ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error deleting FAQ',
        error: error.message
      });
    }
  },

  // Toggle FAQ status (Admin only)
  async toggleFAQStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      console.log(`🔄 [FAQ Controller] Toggling FAQ ${id} status to: ${is_active}`);

      // Check if FAQ exists
      const existingFAQ = await faqModel.getFAQById(id);
      if (!existingFAQ) {
        return res.status(404).json({
          success: false,
          message: 'FAQ not found'
        });
      }

      const updatedFAQ = await faqModel.updateFAQ(id, {
        is_active: is_active,
        updated_at: new Date().toISOString()
      });

      console.log(`✅ [FAQ Controller] Successfully toggled FAQ ${id} status to: ${is_active}`);
      
      res.json({
        success: true,
        data: updatedFAQ,
        message: `FAQ ${is_active ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error(`❌ [FAQ Controller] Error in toggleFAQStatus ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error updating FAQ status',
        error: error.message
      });
    }
  },

  // Get all FAQs for admin (including inactive)
  async getAllFAQsForAdmin(req, res) {
    try {
      console.log('👑 [FAQ Controller] Fetching all FAQs for admin');
      const faqs = await faqModel.getAllFAQsForAdmin();
      
      console.log(`✅ [FAQ Controller] Successfully retrieved ${faqs.length} FAQs for admin`);
      
      res.json({
        success: true,
        data: faqs,
        message: 'FAQs retrieved successfully for admin',
        count: faqs.length
      });
    } catch (error) {
      console.error('❌ [FAQ Controller] Error in getAllFAQsForAdmin:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving FAQs for admin',
        error: error.message
      });
    }
  }
};