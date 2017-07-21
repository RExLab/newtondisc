{
  "targets": [
    {
      "target_name": "panel",
	  "sources": [ 
		  "src/panel.cc",
		  "src/gpio.cc",
		  "src/gpioclass.h"
		  ],
		  
      "include_dirs": [
		  "<!(node -e \"require('nan')\")"
		  
      ]
    }
  ]
}
