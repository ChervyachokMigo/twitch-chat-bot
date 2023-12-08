del bin\pp_calculator /Q /F /S
rd bin\pp_calculator /S /Q
md bin\pp_calculator
xcopy bin\osu-tools-master\PerformanceCalculator\bin\Debug\net6.0-windows10.0.17763.0 bin\pp_calculator /E /Q /H /R /Y
del bin\osu-tools-master\PerformanceCalculator\bin\Debug\net6.0-windows10.0.17763.0 /Q /F /S
rd bin\osu-tools-master\PerformanceCalculator\bin\Debug\net6.0-windows10.0.17763.0 /S /Q