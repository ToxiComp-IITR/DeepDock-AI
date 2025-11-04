# DeepDock-AI: A Web-Based Platform for Protein-Ligand Binding Affinity Prediction

DeepDock-AI is an advanced web platform that predicts the binding affinity between a protein and a ligand using state-of-the-art deep learning models. It provides a user-friendly interface for inputting molecular data and visualizing prediction results, including 3D structures.

## Features

-   **Ligand Input**: Supports single or batch SMILES strings.
-   **Protein Input**: Accepts FASTA sequences or PDB ID data.
-   **Data Fetching**: Retrieves molecular and protein data from PubChem and PDB databases.
-   **AI Models**: Utilizes multiple deep learning architectures (CNN and GNN) for accurate predictions.
-   **Result Visualization**: Displays 2D and 3D structures of molecules and proteins.
-   **Consistent Results**: Caching mechanism ensures that the same input always produces the same result.
-   **Secure**: The training dataset is kept private and is not publicly accessible.

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd DeepDock-AI
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

### Running the Application

1.  **Start the development server:**

    ```bash
    npm run dev
    ```

2.  **Open your browser:**

    Navigate to `http://localhost:5173` to see the application in action.

## How to Use

1.  **Enter Ligand Information**: Provide the SMILES string for the ligand you want to test.
2.  **Enter Protein Information**: Input the protein's FASTA sequence or PDB data.
3.  **Select a Model**: Choose between the available deep learning models (CNN or GNN).
4.  **Run Prediction**: Click the "Start Prediction" button to begin the analysis.
5.  **View Results**: The predicted binding affinity, confidence score, and 3D visualizations will be displayed.

This `README.md` file should give any user a clear understanding of your project and how to get it running. Let me know if you need any other modifications!

#Contact

For any questions or feedback, please contact ontact

For any questions or feedback, please contact EMAIL].