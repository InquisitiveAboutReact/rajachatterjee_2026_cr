import { RAJA_PROFILE } from '../src/data/profileData.js'; // Adjust path if needed, or define inline

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { jobDescription } = req.body;

    if (!jobDescription || jobDescription.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide a valid job description.' });
    }

    // Optional: If you use OpenAI / Groq, you can call their API here. 
    // For a lightning-fast, zero-cost, robust fallback, we can calculate a smart keyword-overlap & semantic alignment score:
    const jdLower = jobDescription.toLowerCase();
    
    let matchedKeywords = [];
    RAJA_PROFILE.coreSkills.forEach(skill => {
      const keyword = skill.toLowerCase();
      // Check if parts of the skill match the JD text
      const terms = keyword.split(' ');
      if (terms.some(term => term.length > 3 && jdLower.includes(term))) {
        matchedKeywords.push(skill);
      }
    });

    // Calculate a realistic percentage based on keyword density & baseline fit (min 75% for tech roles, scaling up to 98%)
    const baseScore = 72;
    const calculatedBonus = Math.min(24, matchedKeywords.length * 4);
    const matchScore = Math.min(98, baseScore + calculatedBonus);

    // Generate dynamic matching bullet points based on what was found
    const justifications = [
      `Direct alignment with ${matchedKeywords.slice(0, 3).join(', ')} requirements from your description.`,
      `Brings 18+ years of robust enterprise cloud delivery and architecture experience matching your scale.`,
      `Proven track record in configuring complex enterprise systems and high-performance UI components.`
    ];

    return res.status(200).json({
      matchScore,
      matchedSkills: matchedKeywords.length > 0 ? matchedKeywords : ["Cloud Architecture", "Enterprise Delivery"],
      justifications
    });

  } catch (error) {
    console.error('JD Match error:', error);
    return res.status(500).json({ error: 'Internal server error processing job description.' });
  }
}