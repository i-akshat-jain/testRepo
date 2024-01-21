import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:yale_research/graphData.dart';


var headers = {
  'Content-Type': 'application/json',
  'Accept': '*/*',
};
Future<void> fetchData() async {
  final response = await http.get(
      Uri.parse('http://localhost:8000/api/my-endpoint/'),
      headers: headers);
  if (response.statusCode == 200) {
    final Map<String, dynamic> data = json.decode(response.body);
    print(data['message']);
  } else {
    print('Failed to load data');
  }
}

Future<void> fetchGraphData(BuildContext context) async {
  final response = await http.get(
    Uri.parse('http://localhost:8000/api/graph-data/'),
    headers: headers,
  );
  if (response.statusCode == 200) {
    final Map<String, dynamic> responseData = json.decode(response.body);
    final String? imageUrl = responseData['image_url'];
    if (imageUrl != null) {
      // Extract the graph data and call a function to display the graph
      displayGraph(context, imageUrl);
    } else {
      print('Image URL is null');
    }
  } else {
    print('Failed to load graph data');
  }
}



