
// PDB (Protein Data Bank) utilities for fetching protein structures

export interface PDBInfo {
  id: string;
  title: string;
  description?: string;
  method?: string;
  resolution?: string;
  depositionDate?: string;
  releaseDate?: string;
  chainIds?: string[];
  experimentalTechnique?: string;
}

export interface PDBEntity {
  entityId: string;
  chainIds: string[];
  sequence?: string;
  moleculeType?: string;
  name?: string;
}

/**
 * Fetch PDB structure file
 */
export const fetchPDBStructure = async (pdbId: string): Promise<string | null> => {
  try {
    const normalizedId = pdbId.toUpperCase().trim();
    const response = await fetch(
      `https://files.rcsb.org/download/${normalizedId}.pdb`,
      {
        headers: {
          'Accept': 'text/plain',
        }
      }
    );

    if (response.ok) {
      const pdbData = await response.text();
      if (pdbData && pdbData.length > 100) { // Valid PDB should be substantial
        return pdbData;
      }
    }
    return null;
  } catch (error) {
    console.error('PDB structure fetch error:', error);
    return null;
  }
};

/**
 * Fetch PDB basic information
 */
export const fetchPDBInfo = async (pdbId: string): Promise<PDBInfo | null> => {
  try {
    const normalizedId = pdbId.toUpperCase().trim();
    const response = await fetch(
      `https://data.rcsb.org/rest/v1/core/entry/${normalizedId}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      
      return {
        id: normalizedId,
        title: data.struct?.title || 'Unknown',
        description: data.struct?.pdbx_descriptor || undefined,
        method: data.exptl?.[0]?.method || undefined,
        resolution: data.rcsb_entry_info?.resolution_combined?.[0]?.toString() || undefined,
        depositionDate: data.rcsb_accession_info?.deposit_date || undefined,
        releaseDate: data.rcsb_accession_info?.initial_release_date || undefined,
        chainIds: data.rcsb_entry_container_identifiers?.polymer_entity_ids || [],
        experimentalTechnique: data.exptl?.[0]?.method || undefined
      };
    }
    return null;
  } catch (error) {
    console.error('PDB info fetch error:', error);
    return null;
  }
};

/**
 * Search PDB by sequence using BLAST
 */
export const searchPDBBySequence = async (
  sequence: string,
  options: {
    evalue_cutoff?: number;
    identity_cutoff?: number;
    sequence_type?: 'protein' | 'dna' | 'rna';
  } = {}
): Promise<any[]> => {
  try {
    const {
      evalue_cutoff = 0.01, // Increased stringency
      identity_cutoff = 30, // Minimum 30% identity
      sequence_type = 'protein'
    } = options;

    const cleanSequence = sequence.replace(/^>.*\n/gm, '').replace(/\s+/g, '');
    
    const query = {
      query: {
        type: 'group',
        logical_operator: 'and',
        nodes: [
          {
            type: 'terminal',
            service: 'sequence',
            parameters: {
              evalue_cutoff,
              identity_cutoff,
              sequence_type,
              value: cleanSequence
            }
          }
        ]
      },
      return_type: 'polymer_entity',
      request_options: {
        paginate: {
          start: 0,
          rows: 100 // Increased result count
        },
        results_content_type: ['experimental'],
        scoring_strategy: 'sequence_identity', // Changed to sequence identity
        sort: [
          {
            sort_by: 'score',
            direction: 'desc'
          }
        ]
      }
    };

    const response = await fetch('https://search.rcsb.org/rcsbsearch/v2/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(query)
    });

    if (response.ok) {
      const data = await response.json();
      return data.result_set || [];
    }
    return [];
  } catch (error) {
    console.error('PDB sequence search error:', error);
    return [];
  }
};

/**
 * Fetch polymer entity details
 */
export const fetchPolymerEntityDetails = async (entityId: string): Promise<any> => {
  try {
    const response = await fetch(
      `https://data.rcsb.org/rest/v1/polymer_entity/${entityId}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Polymer entity details fetch error:', error);
    return null;
  }
};

/**
 * Get best matching PDB for a sequence
 */
export const findBestMatchPDB = async (sequence: string): Promise<{
  pdbId: string;
  entityId: string;
  score: number;
  info?: PDBInfo;
} | null> => {
  try {
    const results = await searchPDBBySequence(sequence, {
      evalue_cutoff: 0.1,
      identity_cutoff: 0,
      sequence_type: 'protein'
    });

    if (results.length > 0) {
      const bestMatch = results[0];
      const entityId = bestMatch.identifier;
      
      // Extract PDB ID from entity ID (format: entityId contains PDB code)
      const pdbIdMatch = entityId.match(/([1-9][A-Z0-9]{3})/);
      const pdbId = pdbIdMatch ? pdbIdMatch[1] : null;

      if (pdbId) {
        const info = await fetchPDBInfo(pdbId);
        
        return {
          pdbId,
          entityId,
          score: bestMatch.score || 0,
          info
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Find best PDB match error:', error);
    return null;
  }
};

/**
 * Fetch chain sequences from PDB
 */
export const fetchPDBChainSequence = async (pdbId: string, chainId?: string): Promise<string[]> => {
  try {
    const normalizedId = pdbId.toUpperCase().trim();
    const response = await fetch(
      `https://data.rcsb.org/rest/v1/core/polymer_entity/${normalizedId}/${chainId || 1}/sequence`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.sequences || [];
    }
    return [];
  } catch (error) {
    console.error('PDB chain sequence fetch error:', error);
    return [];
  }
};

/**
 * Validate PDB ID format
 */
export const validatePDBId = (pdbId: string): boolean => {
  const pattern = /^[1-9][A-Z0-9]{3}$/;
  return pattern.test(pdbId.toUpperCase());
};

