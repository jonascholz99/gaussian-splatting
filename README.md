# Gaussian Splatting Library

## Overview
This framework represents an advancement and restructuring of the `gsplat.js` framework by Dylan Ebert. The original framework, which provides the foundational structure, can be found here: [gsplat.js on GitHub](https://github.com/huggingface/gsplat.js). 

This modified framework is derived from a master's thesis titled 'DimSplat. Development of a Diminished Reality Prototype with Gaussian Splats for Mobile Augmented Reality Applications'.

## Modifications

Certainly! Here's the professionally translated text:

This version has been adapted to meet the specific requirements and functionalities for the research project. The comprehensive changes include adjustments in splat generation, clustering, rendering, payload for the worker, and much more. It is important to note that it is still built upon Dylan Ebert's framework and utilizes its fundamental structure.

Additionally, as previously mentioned, a method for clustering the splats has been integrated. For this purpose, the `three.js`-based Octree framework `sparse-octree` was utilized and adapted to the SPLAT framework. The original code for the Octree can be found here: [sparse-octree on GitHub](https://github.com/vanruesc/sparse-octree).

## Intended Use

The code in this repository is not intended for public use. It has been developed specifically for use within this research project and should not be used for other purposes without proper authorization.

## Acknowledgments

Special thanks to the team at Hugging Face for providing the `gsplat.js` framework, which serves as the foundation for this project-specific adaptation.
