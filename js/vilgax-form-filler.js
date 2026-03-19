/**
 * VILGAX Voice Form Filling Engine
 * Handles voice-controlled form population and validation
 * 
 * Features:
 * - Auto-detect form fields
 * - Voice input for each field
 * - Intelligent field matching
 * - Confirmation and validation
 * - Multi-language support
 */

class VILGAXFormFiller {
  constructor() {
    this.currentForm = null;
    this.fields = [];
    this.fieldIndex = 0;
    this.isFillingForm = false;
    this.formData = {};
  }

  /**
   * Start Voice Form Filling
   */
  startVoiceFormFilling(formSelector) {
    const form = document.querySelector(formSelector);
    if (!form) {
      console.error('Form not found:', formSelector);
      return false;
    }

    this.currentForm = form;
    this.fields = this.extractFormFields(form);
    this.fieldIndex = 0;
    this.isFillingForm = true;
    this.formData = {};

    if (this.fields.length === 0) {
      console.warn('No fields found in form');
      return false;
    }

    console.log(`📋 Starting voice form filling for ${this.fields.length} fields`);
    this.promptNextField();
    return true;
  }

  /**
   * Extract Form Fields
   */
  extractFormFields(form) {
    const fields = [];
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach((field) => {
      if (field.type !== 'hidden' && field.type !== 'submit') {
        fields.push({
          element: field,
          name: field.name || field.id,
          type: field.type,
          label: this.getFieldLabel(field),
          required: field.required
        });
      }
    });

    return fields;
  }

  /**
   * Get Field Label
   */
  getFieldLabel(field) {
    // Try to find associated label
    if (field.id) {
      const label = document.querySelector(`label[for="${field.id}"]`);
      if (label) return label.textContent;
    }

    // Try placeholder
    if (field.placeholder) return field.placeholder;

    // Try aria-label
    if (field.getAttribute('aria-label')) return field.getAttribute('aria-label');

    // Fallback to name
    return field.name || field.id || 'field';
  }

  /**
   * Prompt for Next Field
   */
  promptNextField() {
    if (this.fieldIndex >= this.fields.length) {
      this.completeFormFilling();
      return;
    }

    const field = this.fields[this.fieldIndex];
    const prompt = `Please provide your ${field.label}`;

    console.log(`🎤 Prompting: ${prompt}`);
    
    if (vilgax) {
      vilgax.respond(`📝 ${prompt}`);
      audio?.speak(prompt);
    }

    // Listen for voice response
    this.listenForFieldInput(field);
  }

  /**
   * Listen for Field Input
   */
  listenForFieldInput(field) {
    if (!audio || !audio.recognition) {
      console.error('Speech recognition not available');
      return;
    }

    audio.recognition.onresult = (event) => {
      let transcript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }

      if (transcript) {
        this.processFieldInput(field, transcript);
      }
    };

    audio.listen();
  }

  /**
   * Process Field Input
   */
  processFieldInput(field, input) {
    console.log(`📥 Field: ${field.name} = ${input}`);

    // Validate input type
    let processedValue = input;

    if (field.type === 'email') {
      // Simple email validation
      if (!input.includes('@')) {
        vilgax?.respond('❌ Please provide a valid email address');
        audio?.speak('That doesn\'t look like a valid email. Please try again.');
        this.listenForFieldInput(field);
        return;
      }
    } else if (field.type === 'tel' || field.type === 'phone') {
      // Phone number cleanup
      processedValue = input.replace(/\D/g, '');
      if (processedValue.length < 10) {
        vilgax?.respond('❌ Phone number too short');
        audio?.speak('That phone number is too short. Please try again.');
        this.listenForFieldInput(field);
        return;
      }
    } else if (field.type === 'date') {
      // Parse date
      const dateMatch = input.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
      if (!dateMatch) {
        vilgax?.respond('❌ Invalid date format');
        audio?.speak('I didn\'t understand the date. Please say it in DD slash MM slash YYYY format.');
        this.listenForFieldInput(field);
        return;
      }
      processedValue = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
    }

    // Store value
    this.formData[field.name] = processedValue;
    field.element.value = processedValue;

    // Confirm to user
    vilgax?.respond(`✅ Got it: ${processedValue}`);
    audio?.speak(`Confirmed: ${processedValue}`);

    // Move to next field
    setTimeout(() => {
      this.fieldIndex++;
      this.promptNextField();
    }, 1500);
  }

  /**
   * Complete Form Filling
   */
  completeFormFilling() {
    console.log('✅ Form filling complete');
    this.isFillingForm = false;

    vilgax?.respond('✅ Form completed! Review details and submit.');
    audio?.speak('Form completed. Please review the details and click submit to proceed.');

    // Highlight form
    this.currentForm?.scrollIntoView({ behavior: 'smooth' });
    this.currentForm?.style.setProperty('border', '2px solid #14b8a6', 'important');

    setTimeout(() => {
      this.currentForm?.style.removeProperty('border');
    }, 3000);
  }

  /**
   * Cancel Form Filling
   */
  cancelFormFilling() {
    console.log('❌ Form filling cancelled');
    this.isFillingForm = false;
    this.fieldIndex = 0;
    this.formData = {};
    vilgax?.respond('Form filling cancelled');
  }

  /**
   * Get Form Data
   */
  getFormData() {
    return this.formData;
  }

  /**
   * Auto-Fill Support
   */
  autoPopulateFromBuffer(data) {
    const form = this.currentForm;
    if (!form) return false;

    Object.entries(data).forEach(([key, value]) => {
      const field = form.querySelector(`[name="${key}"], [id="${key}"]`);
      if (field) {
        field.value = value;
        this.formData[key] = value;
      }
    });

    return true;
  }
}

// Global instance
let vilgaxFormFiller = new VILGAXFormFiller();

// Expose globally
window.VILGAXFormFiller = VILGAXFormFiller;
window.vilgaxFormFiller = vilgaxFormFiller;
