import 'package:flutter/material.dart';

class GraphDisplay extends StatelessWidget {
  final String imageUrl;

  const GraphDisplay({Key? key, required this.imageUrl}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Image.network(imageUrl);
  }
}
