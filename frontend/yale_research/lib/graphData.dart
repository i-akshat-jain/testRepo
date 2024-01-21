import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:yale_research/graphDisplay.dart';



void displayGraph(BuildContext context, String imageUrl) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        title: Text("Graph Display"),
        content: GraphDisplay(imageUrl: imageUrl),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: Text('Close'),
          ),
        ],
      );
    },
  );
}


