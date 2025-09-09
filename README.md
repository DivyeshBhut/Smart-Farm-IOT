
# Smart Farm IoT Project (Python Simulation)

This repository contains the resources for a Smart Farming simulation. The system uses a Python script to generate environmental data (temperature, humidity, soil moisture) and sends it to the ThingSpeak platform. This allows for the development and visualization of a smart farm monitoring system without the need for physical hardware.

## Overview

The goal of this project is to simulate a "smart farm" environment. A Python script acts as a virtual sensor hub, generating realistic data and pushing it to the cloud. This decouples the data analysis and visualization from the physical hardware, making it ideal for testing, development, and demonstration purposes.

The simulation sends data to a ThingSpeak channel, where it can be monitored and analyzed in real-time. This approach allows developers to build and test the cloud-based aspects of an IoT project before deploying physical sensors.

## Features

* Hardware-Free Simulation: Uses a Python script to simulate sensor readings for temperature, humidity, and soil moisture.

* Data Visualization: Sends simulated data to the ThingSpeak IoT platform for live monitoring and graphical representation.

* Cloud-Centric: Focuses on the cloud-based data aggregation and IoT platform interaction.

* Extensible: The Python simulator can be easily modified to produce different data patterns or simulate more complex scenarios.

## System Architecture

The system is architected around a Python script and the ThingSpeak cloud platform.

### Data Source (Python Simulator):

* A Python script runs on a computer, generating values for temperature, humidity, and soil moisture.

* This script simulates the behavior of a real-world farm environment.

### Cloud Platform (ThingSpeak):

* The Python script sends the generated data to a ThingSpeak channel using its API.

* ThingSpeak stores this data and provides tools for real-time plotting and visualization.

## Software Requirements

* Python 3.x
* A ThingSpeak Account
* React
