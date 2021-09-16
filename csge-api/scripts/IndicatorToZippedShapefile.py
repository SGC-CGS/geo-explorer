# -*- coding: utf-8 -*-
# Output the selected indicator in the selected language to a zipped shapefile.

import arcpy
import os
import sys
import zipfile
from pathlib import Path

# To allow overwriting the outputs change the overwrite option to true.
arcpy.env.overwriteOutput = True

# Set Geoprocessing environments
scratch_path_db = arcpy.env.scratchGDB
scratch_folder = arcpy.env.scratchFolder

# Database connection
script_path = sys.path[0]
one_folder_up = os.path.dirname(script_path)
csge_sde = os.path.join(one_folder_up, "Data", "CSGE.sde")


def build_file_list(path, match_name):
    # look for files in path matching the specified match_name
    listdir = os.listdir(path)
    matching_files = []
    for file_name in listdir:
        file_name_no_ext = Path(file_name).stem # remove extenstion
        
        if file_name_no_ext.lower() == match_name.lower():
            matching_files.append(os.path.join(path, file_name))

    return matching_files


def prepare_dguids(dguids):
    # dguids are comma separated, strip any space,",' and add single quotes 
    # this may not be necessary if dguids are coming in properly formatted
    dguids = dguids.replace('"', '').replace("'", "").replace(" ", "") 
    dguid_list = dguids.split(',') # convert to list
    quoted_dguids = str(dguid_list)[1:-1] # convert to quoted comma sep string
    
    return quoted_dguids
    
    
def indicator_to_shapefile(OutputZip, IndicatorID, Language, DGUIDs):

    # prepare DGUIDs if present
    dguid_str = prepare_dguids(DGUIDs)

    # Get Primary Query from DB
    pq_rows = arcpy.TableSelect_analysis(
        in_table=os.path.join(csge_sde, "STC_DV.gis.IndicatorMetaData"), 
        out_table=os.path.join(scratch_path_db, "ind_sel"), 
        where_clause="IndicatorId = " + IndicatorID
    )
       
    # Get first row value of PrimaryQuery column
    pq_query_str = ""
    with arcpy.da.SearchCursor(pq_rows, ["PrimaryQuery"]) as cursor:
        for row in cursor:
            pq_query_str = row[0]
            if DGUIDs != "":
                pq_query_str += " WHERE grfi.GeographyReferenceID IN (" + dguid_str + ") "
            
    # Make Query Layer from result of primary query
    sr = arcpy.SpatialReference(3857) # WGS_1984_Web_Mercator_Auxiliary_Sphere
    all_polys = arcpy.MakeQueryLayer_management(input_database=csge_sde, 
        out_layer_name=os.path.join(scratch_path_db, "all_polys.shp"), 
        query=pq_query_str, oid_fields="GeographyReferenceID", 
        shape_type="POLYGON", spatial_reference=sr)
        
    # turn query layer into feature layer (required for altering fields)
    # must use scratch db for this process 
    saved_lyr = os.path.join(scratch_path_db, "saved_lyr")
    arcpy.CopyFeatures_management(all_polys, saved_lyr)
    
    # select and rename fields to be exported based on language selection
    # note special characters are automatically changed to _ by arcpy
    field_dict = { 
        "OBJECTID": "OBJECTID", 
        "FID": "FID",         
        "Shape": "Shape", 
        "Shape_Length": "Shape_Length", 
        "Shape_Area": "Shape_Area"
    }
    if Language == "en":
        field_dict["GeographyReferenceId"] = "DGUID"
        field_dict["DisplayNameLong_EN"] = "Location" # DisplayN_2
        field_dict["ProvTerrName_EN"] = "Province_Territory" # ProvTerrNa
        field_dict["Value"] = "Value"
        field_dict["NullDescription_EN"] = "Data_Comment" # NullDescri
    
    else:
        field_dict["GeographyReferenceId"] = "IDUGD" 
        field_dict["DisplayNameLong_FR"] = "Endroit" # DisplayN_3
        field_dict["ProvTerrName_FR"] = "Province_Territoire" # ProvTerr_1
        field_dict["Value"] = "Valeur" 
        field_dict["NullDescription_FR"] = "Commentaire" # NullDesc_1
    
    # Delete any fields not needed for output, rename the others as per dict
    for f in arcpy.ListFields(saved_lyr):
        if f.name not in (field_dict).keys():
            arcpy.management.DeleteField(saved_lyr, f.name)
        else:
            arcpy.management.AlterField(saved_lyr, f.name, field_dict[f.name])           
     
    # turn query layer into feature layer (required for altering fields)
    # Note - must use scratch folder for this process or published service will fail
    copied_lyr = os.path.join(scratch_folder, "Export")
    arcpy.CopyFeatures_management(saved_lyr, copied_lyr)        
    
    # zip shapefile
    files_to_zip = build_file_list(scratch_folder, "Export")
    with zipfile.ZipFile(OutputZip, "w", zipfile.ZIP_DEFLATED) as myZip:
        for file in files_to_zip:
            myZip.write(file, os.path.basename(file))
    
    
if __name__ == '__main__':
    args = tuple(arcpy.GetParameterAsText(i) for i in range(arcpy.GetArgumentCount()))
    indicator_to_shapefile(*args)
    

