from src.resumeParser import parser
import os

if __name__ == "__main__":
    # code to run when executed directly
    sampleResumesDir = "test/sampleResumes"
    for fileName in os.listdir(sampleResumesDir):
        filePath = os.path.join(sampleResumesDir,fileName)
        parser(filePath)
        
        
