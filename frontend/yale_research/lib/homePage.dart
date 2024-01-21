import 'package:flutter/material.dart';
import 'package:yale_research/api/apiCalls.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        children: [
          Text("Hi this is abhishek jain and this is my website"),
          ElevatedButton(
            onPressed: () {
              fetchGraphData(context);
            },
            child: Text('Click me to call Django API and display graph'),
          )
        ],
      ),
    );
  }
}
