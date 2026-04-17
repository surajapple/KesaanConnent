const PEST_DB = {
  rice: [
    { name: 'Brown Planthopper', severity: 'High', symptoms: 'Yellowing, honeydew deposits', management: ['Drain fields periodically', 'Spray Imidacloprid 70 WG @ 30g/acre'], season: 'Kharif' },
    { name: 'Stem Borer', severity: 'Medium', symptoms: 'Dead heart, white ears', management: ['Install pheromone traps', 'Spray Chlorpyriphos 20 EC @ 500ml/acre'], season: 'All seasons' },
  ],
  wheat: [
    { name: 'Aphids', severity: 'Medium', symptoms: 'Sticky honeydew, yellowing', management: ['Spray Dimethoate 30 EC @ 300ml/acre', 'Introduce ladybird beetles'], season: 'Rabi' },
    { name: 'Termites', severity: 'High', symptoms: 'Yellowing, drying, soil tubes', management: ['Treat soil with Chlorpyriphos 20 EC', 'Remove crop stubble after harvest'], season: 'All seasons' },
  ],
  cotton: [
    { name: 'Bollworm', severity: 'High', symptoms: 'Entry holes in bolls, pinholes with frass', management: ['Install pheromone traps @ 5/acre', 'Spray Spinosad 45% SC @ 75ml/acre'], season: 'Kharif' },
    { name: 'Whitefly', severity: 'Medium', symptoms: 'Yellowing, sticky honeydew, sooty mold', management: ['Spray Acetamiprid 20 SP @ 40g/acre', 'Install yellow sticky traps'], season: 'Kharif' },
  ],
  maize: [
    { name: 'Fall Armyworm', severity: 'High', symptoms: 'Ragged leaf damage, whorl entry holes', management: ['Apply Emamectin Benzoate 5 SG @ 80g/acre', 'Release Trichogramma egg parasitoid'], season: 'Kharif' },
  ],
  tomato: [
    { name: 'Fruit Borer', severity: 'High', symptoms: 'Circular entry holes in fruits, premature dropping', management: ['Spray Spinosad 45% SC @ 75ml/acre', 'Collect and destroy infested fruits'], season: 'All seasons' },
  ],
  general: [
    { name: 'Locusts', severity: 'Critical', symptoms: 'Complete defoliation, large swarms', management: ['Contact local agriculture dept immediately', 'Spray Malathion 96 ULV aerial spray'], season: 'Seasonal' },
    { name: 'Cutworms', severity: 'Medium', symptoms: 'Seedlings cut at base, wilting in patches', management: ['Apply Chlorpyriphos 20 EC soil treatment', 'Deep summer ploughing'], season: 'All seasons' },
  ],
};

const getPests = async (req, res) => {
  try {
    const { crop } = req.query;
    const key = crop?.toLowerCase();
    const specific = PEST_DB[key] || [];
    const data = [...specific, ...PEST_DB.general];
    res.json({ success: true, crop: crop || 'general', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getPests };
