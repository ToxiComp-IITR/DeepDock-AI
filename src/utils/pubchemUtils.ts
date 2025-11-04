
// PubChem API utilities for fetching compound data

export interface PubChemProperties {
  cid: string;
  molecularWeight: number;
  molecularFormula: string;
  canonicalSmiles: string;
  isomericSmiles: string;
  logP?: number;
  topologicalPolarSurfaceArea?: number;
  hBondDonor?: number;
  hBondAcceptor?: number;
  rotatableBondCount?: number;
  complexity?: number;
  xLogP3?: number;
}

export interface PubChemRecord {
  properties: PubChemProperties;
  description?: string;
  synonyms?: string[];
}

/**
 * Fetch PubChem CID from SMILES
 */
export const fetchPubChemCID = async (smiles: string): Promise<string | null> => {
  try {
    const normalizedSmiles = smiles.trim().replace(/\s+/g, '');
    const response = await fetch(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(normalizedSmiles)}/cids/JSON`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      const cid = data.IdentifierList?.CID?.[0];
      return cid ? cid.toString() : null;
    }
    return null;
  } catch (error) {
    console.error('PubChem CID fetch error:', error);
    return null;
  }
};

/**
 * Fetch comprehensive PubChem properties
 */
export const fetchPubChemProperties = async (smiles: string): Promise<PubChemProperties | null> => {
  try {
    const cid = await fetchPubChemCID(smiles);
    if (!cid) return null;

    // Enhanced property list for more accurate data
    const properties = [
      'MolecularWeight',
      'MolecularFormula',
      'CanonicalSMILES',
      'IsomericSMILES',
      'LogP',
      'TopologicalPolarSurfaceArea',
      'HydrogenBondDonorCount',
      'HydrogenBondAcceptorCount',
      'RotatableBondCount',
      'Complexity',
      'XLogP3',
      'ExactMass',
      'MonoisotopicMass',
      'IUPAC_Name',
      'InChI',
      'InChIKey'
    ];

    const response = await fetch(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/${properties.join(',')}/JSON`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      const props = data.PropertyTable?.Properties?.[0];
      
      if (props) {
        return {
          cid: cid,
          molecularWeight: props.MolecularWeight || 0,
          molecularFormula: props.MolecularFormula || '',
          canonicalSmiles: props.CanonicalSMILES || smiles,
          isomericSmiles: props.IsomericSMILES || smiles,
          logP: props.LogP,
          topologicalPolarSurfaceArea: props.TopologicalPolarSurfaceArea,
          hBondDonor: props.HydrogenBondDonorCount,
          hBondAcceptor: props.HydrogenBondAcceptorCount,
          rotatableBondCount: props.RotatableBondCount,
          complexity: props.Complexity,
          xLogP3: props.XLogP3,
          exactMass: props.ExactMass,
          monoisotopicMass: props.MonoisotopicMass,
          iupacName: props.IUPAC_Name,
          inchi: props.InChI,
          inchiKey: props.InChIKey
        };
      }
    }
    return null;
  } catch (error) {
    console.error('PubChem properties fetch error:', error);
    return null;
  }
};

/**
 * Fetch 3D structure SDF from PubChem
 */
export const fetchPubChem3DStructure = async (cid: string): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/record/SDF/?record_type=3d&response_type=save&response_basename=Structure3D`,
      {
        headers: {
          'Accept': 'chemical/x-sdf',
        }
      }
    );

    if (response.ok) {
      const sdfData = await response.text();
      if (sdfData && sdfData.length > 0 && !sdfData.includes('Status')) {
        return sdfData;
      }
    }
    return null;
  } catch (error) {
    console.error('PubChem 3D structure fetch error:', error);
    return null;
  }
};

/**
 * Fetch PubChem description
 */
export const fetchPubChemDescription = async (cid: string): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/description/JSON`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      const description = data.InformationList?.Information?.[0]?.Description;
      return description || null;
    }
    return null;
  } catch (error) {
    console.error('PubChem description fetch error:', error);
    return null;
  }
};

/**
 * Fetch 2D structure PNG from PubChem
 */
export const getPubChem2DImageURL = (cid: string, width: number = 300, height: number = 300): string => {
  return `https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid=${cid}&width=${width}&height=${height}`;
};

/**
 * Complete PubChem record fetch
 */
export const fetchCompletePubChemRecord = async (smiles: string): Promise<PubChemRecord | null> => {
  try {
    const properties = await fetchPubChemProperties(smiles);
    if (!properties) return null;

    const description = await fetchPubChemDescription(properties.cid);
    
    return {
      properties,
      description: description || undefined,
      synonyms: undefined // Can be fetched separately if needed
    };
  } catch (error) {
    console.error('Complete PubChem record fetch error:', error);
    return null;
  }
};

